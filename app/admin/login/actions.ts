"use server";

import { redirect } from "next/navigation";

import { createAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function loginAction(
  formData: FormData
): Promise<{ ok: false; error: string } | void> {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return { ok: false, error: "Enter the admin password." };
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return {
      ok: false,
      error: "ADMIN_PASSWORD and SESSION_SECRET aren't configured on the server yet.",
    };
  }

  if (!verifyAdminPassword(password)) {
    return { ok: false, error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin/hero");
}
