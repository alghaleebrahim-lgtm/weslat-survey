"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { HeroImageRow } from "@/lib/db";

export function SortableHeroRow({
  image,
  position,
  total,
  onToggleActive,
  onEdit,
  onDelete,
  onMove,
}: {
  image: HeroImageRow;
  position: number;
  total: number;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (image: HeroImageRow) => void;
  onDelete: (image: HeroImageRow) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} data-dragging={isDragging} className="data-[dragging=true]:opacity-70">
      <TableCell className="w-10">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex size-7 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-secondary active:cursor-grabbing"
          aria-label={`Drag to reorder ${image.title ?? "image"}`}
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
      </TableCell>
      <TableCell className="w-20">
        {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of a remote, user-uploaded asset */}
        <img src={image.src} alt="" className="aspect-[3/2] w-16 rounded-sm border border-border object-cover" />
      </TableCell>
      <TableCell>
        <div className="font-medium text-foreground">{image.title || "Untitled"}</div>
        {image.description && (
          <div className="line-clamp-1 text-xs text-muted-foreground">{image.description}</div>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={image.isActive ? "default" : "secondary"}>
          {image.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={image.isActive}
          onCheckedChange={(checked) => onToggleActive(image.id, checked)}
          aria-label={image.isActive ? "Deactivate" : "Activate"}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={position === 0}
            onClick={() => onMove(image.id, "up")}
            aria-label={`Move ${image.title ?? "image"} up`}
          >
            <ArrowUp className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            disabled={position === total - 1}
            onClick={() => onMove(image.id, "down")}
            aria-label={`Move ${image.title ?? "image"} down`}
          >
            <ArrowDown className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEdit(image)}
            aria-label={`Edit ${image.title ?? "image"}`}
          >
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(image)}
            aria-label={`Delete ${image.title ?? "image"}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
