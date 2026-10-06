"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";
import type { HeroImageRow } from "@/lib/db";
import {
  deleteHeroImageAction,
  reorderHeroImagesAction,
  seedStarterHeroImagesAction,
  setHeroImageActiveAction,
} from "@/app/admin/(dashboard)/hero/actions";
import { HeroImageFormDialog } from "./hero-image-form-dialog";
import { SortableHeroRow } from "./sortable-hero-row";

export function HeroImageManager({ initialImages }: { initialImages: HeroImageRow[] }) {
  const [images, setImages] = React.useState(initialImages);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<HeroImageRow | undefined>(undefined);
  const [deleting, setDeleting] = React.useState<HeroImageRow | null>(null);
  const [deletePending, setDeletePending] = React.useState(false);
  const [seeding, setSeeding] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(image: HeroImageRow) {
    setEditing(image);
    setFormOpen(true);
  }

  function handleSaved(row: HeroImageRow) {
    setImages((prev) => {
      const exists = prev.some((image) => image.id === row.id);
      return exists
        ? prev.map((image) => (image.id === row.id ? row : image))
        : [...prev, row].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  }

  async function persistOrder(next: HeroImageRow[]) {
    const result = await reorderHeroImagesAction(next.map((image) => image.id));
    if (!result.ok) {
      toast.error(result.error);
      setImages(images); // revert to the last known-good order
      return;
    }
    toast.success("Order saved.");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((image) => image.id === active.id);
      const newIndex = prev.findIndex((image) => image.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      void persistOrder(next);
      return next;
    });
  }

  function handleMove(id: string, direction: "up" | "down") {
    setImages((prev) => {
      const index = prev.findIndex((image) => image.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = arrayMove(prev, index, swapWith);
      void persistOrder(next);
      return next;
    });
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    const previous = images;
    setImages((prev) => prev.map((image) => (image.id === id ? { ...image, isActive } : image)));
    const result = await setHeroImageActiveAction(id, isActive);
    if (!result.ok) {
      toast.error(result.error);
      setImages(previous);
      return;
    }
    toast.success(isActive ? "Image activated." : "Image deactivated.");
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setDeletePending(true);
    const result = await deleteHeroImageAction(deleting.id);
    setDeletePending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setImages((prev) => prev.filter((image) => image.id !== deleting.id));
    toast.success("Image deleted.");
    setDeleting(null);
  }

  async function handleSeed() {
    setSeeding(true);
    const result = await seedStarterHeroImagesAction();
    setSeeding(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setImages(result.data);
    toast.success("Starter images loaded.");
  }

  const activeImages = images.filter((image) => image.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
            Hero Images
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes here update the homepage immediately.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" aria-hidden="true" />
          Upload image
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {images.length === 0 ? (
            <div className="space-y-4 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No images yet. Upload one, or load 12 curated documentary/humanitarian
                starter images to get going.
              </p>
              <Button type="button" variant="outline" onClick={handleSeed} disabled={seeding}>
                {seeding ? "Loading…" : "Load starter images"}
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10" />
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContext
                  items={images.map((image) => image.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {images.map((image, index) => (
                      <SortableHeroRow
                        key={image.id}
                        image={image}
                        position={index}
                        total={images.length}
                        onToggleActive={handleToggleActive}
                        onEdit={openEdit}
                        onDelete={setDeleting}
                        onMove={handleMove}
                      />
                    ))}
                  </TableBody>
                </SortableContext>
              </Table>
            </DndContext>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[420px] overflow-hidden rounded-b-sm">
            <ImageStreamHero
              images={activeImages.map((image) => ({
                id: image.id,
                src: image.src,
                alt: image.alt,
              }))}
              headline="Stories that move people. Impact that moves forward."
              description="Preview of the active collection, in order."
              className="h-full"
            />
          </div>
        </CardContent>
      </Card>

      <HeroImageFormDialog
        mode={editing ? "edit" : "create"}
        image={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSaved={handleSaved}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this image?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.title ? `"${deleting.title}"` : "This image"} will be permanently
              removed from the homepage and deleted from storage. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmDelete();
              }}
              disabled={deletePending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletePending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
