// No "server-only" guard here deliberately: this module must also be
// importable from scripts/seed.ts, run directly via `tsx` outside
// Next.js's bundler (where the server-only package always throws). It
// is never imported at runtime from a "use client" file — only type
// imports (erased at compile time) appear there.
import postgres from "postgres";

const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? null;

export const hasDatabase = Boolean(connectionString);

/**
 * Lazily created, process-wide connection. `postgres()` itself doesn't
 * connect until the first query, so this is cheap to create even when
 * `hasDatabase` is false — callers must check `hasDatabase` first.
 */
const sql = connectionString
  ? postgres(connectionString, {
      // "require" for hosted providers (Neon/Vercel Postgres always need TLS);
      // "prefer" so plain local Postgres (no TLS configured) still works.
      ssl: process.env.NODE_ENV === "production" ? "require" : "prefer",
      max: 5,
      // Silences expected "already exists, skipping" NOTICEs from the
      // idempotent `IF NOT EXISTS` DDL in ensureSchema().
      onnotice: () => {},
    })
  : null;

function requireSql() {
  if (!sql) {
    throw new Error(
      "No database configured (POSTGRES_URL / DATABASE_URL is unset)."
    );
  }
  return sql;
}

let schemaReady: Promise<void> | null = null;

/** Idempotent, process-wide: the table is created at most once per server instance. */
function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const db = requireSql();
    schemaReady = (async () => {
      await db`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
      await db`
        CREATE TABLE IF NOT EXISTS hero_images (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          src TEXT NOT NULL,
          storage_key TEXT NOT NULL,
          alt TEXT,
          title TEXT,
          description TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await db`
        CREATE INDEX IF NOT EXISTS hero_images_active_order_idx
          ON hero_images (is_active, sort_order)
      `;
    })();
  }
  return schemaReady;
}

export type HeroImageRow = {
  id: string;
  src: string;
  storageKey: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Raw = {
  id: string;
  src: string;
  storage_key: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

function fromRow(row: Raw): HeroImageRow {
  return {
    id: row.id,
    src: row.src,
    storageKey: row.storage_key,
    alt: row.alt,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listHeroImages(): Promise<HeroImageRow[]> {
  const db = requireSql();
  await ensureSchema();
  const rows = await db<Raw[]>`
    SELECT * FROM hero_images ORDER BY sort_order ASC, created_at ASC
  `;
  return rows.map(fromRow);
}

export async function listActiveHeroImages(): Promise<HeroImageRow[]> {
  const db = requireSql();
  await ensureSchema();
  const rows = await db<Raw[]>`
    SELECT * FROM hero_images WHERE is_active = true ORDER BY sort_order ASC, created_at ASC
  `;
  return rows.map(fromRow);
}

export async function createHeroImage(input: {
  src: string;
  storageKey: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  isActive: boolean;
}): Promise<HeroImageRow> {
  const db = requireSql();
  await ensureSchema();
  const [{ next }] = await db<{ next: number }[]>`
    SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM hero_images
  `;
  const [row] = await db<Raw[]>`
    INSERT INTO hero_images (src, storage_key, alt, title, description, sort_order, is_active)
    VALUES (${input.src}, ${input.storageKey}, ${input.alt}, ${input.title}, ${input.description}, ${next}, ${input.isActive})
    RETURNING *
  `;
  return fromRow(row);
}

export async function updateHeroImage(
  id: string,
  input: {
    /** Only present when the admin replaced the image file. */
    src?: string;
    storageKey?: string;
    alt: string | null;
    title: string | null;
    description: string | null;
    isActive: boolean;
  }
): Promise<HeroImageRow | null> {
  const db = requireSql();
  await ensureSchema();
  const [row] = await db<Raw[]>`
    UPDATE hero_images SET
      src = COALESCE(${input.src ?? null}, src),
      storage_key = COALESCE(${input.storageKey ?? null}, storage_key),
      alt = ${input.alt},
      title = ${input.title},
      description = ${input.description},
      is_active = ${input.isActive},
      updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `;
  return row ? fromRow(row) : null;
}

export async function deleteHeroImage(id: string): Promise<HeroImageRow | null> {
  const db = requireSql();
  await ensureSchema();
  const [row] = await db<Raw[]>`
    DELETE FROM hero_images WHERE id = ${id} RETURNING *
  `;
  return row ? fromRow(row) : null;
}

/** Persists a full reorder in one round trip. */
export async function reorderHeroImages(orderedIds: string[]): Promise<void> {
  const db = requireSql();
  await ensureSchema();
  if (orderedIds.length === 0) return;
  await db.begin((tx) =>
    Promise.all(
      orderedIds.map((id, index) =>
        tx`UPDATE hero_images SET sort_order = ${index}, updated_at = now() WHERE id = ${id}`
      )
    )
  );
}
