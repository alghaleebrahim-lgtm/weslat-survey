"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { HeroImageRow } from "@/lib/db";
import { uploadHeroImageAction, updateHeroImageAction } from "@/app/admin/(dashboard)/hero/actions";

export function HeroImageFormDialog({
  mode,
  image,
  open,
  onOpenChange,
  onSaved,
}: {
  mode: "create" | "edit";
  image?: HeroImageRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (row: HeroImageRow) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Keyed by the target image so switching images (or reopening for
            a new upload) mounts a fresh form with its own initial state,
            instead of resetting state imperatively in an effect. */}
        <HeroImageForm
          key={open ? (image?.id ?? "create") : "closed"}
          mode={mode}
          image={image}
          onCancel={() => onOpenChange(false)}
          onSaved={(row) => {
            onSaved(row);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function HeroImageForm({
  mode,
  image,
  onCancel,
  onSaved,
}: {
  mode: "create" | "edit";
  image?: HeroImageRow;
  onCancel: () => void;
  onSaved: (row: HeroImageRow) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(image?.src ?? null);
  const [title, setTitle] = React.useState(image?.title ?? "");
  const [description, setDescription] = React.useState(image?.description ?? "");
  const [alt, setAlt] = React.useState(image?.alt ?? "");
  const [isActive, setIsActive] = React.useState(image?.isActive ?? true);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : (image?.src ?? null));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "create" && !file) {
      setError("Choose an image file to upload.");
      return;
    }

    const formData = new FormData();
    if (file) formData.set("file", file);
    formData.set("title", title);
    formData.set("description", description);
    formData.set("alt", alt);
    formData.set("isActive", String(isActive));

    setPending(true);
    const result =
      mode === "create"
        ? await uploadHeroImageAction(formData)
        : await updateHeroImageAction(image!.id, formData);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(mode === "create" ? "Image uploaded." : "Image updated.");
    onSaved(result.data);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "Upload image" : "Edit image"}</DialogTitle>
        <DialogDescription>
          {mode === "create"
            ? "Add a new image to the homepage hero collection."
            : "Update this image's details, or replace the file."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="file">{mode === "create" ? "Image file" : "Replace file (optional)"}</Label>
          <Input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 8MB.</p>
        </div>

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local/blob preview, not an optimizable remote asset
          <img
            src={previewUrl}
            alt=""
            className="aspect-[3/2] w-full rounded-sm border border-border object-cover"
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alt">Alt text</Label>
          <Input
            id="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describes the image for screen readers"
          />
        </div>

        <div className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
          <Label htmlFor="isActive" className="cursor-pointer">
            Active on homepage
          </Label>
          <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </DialogFooter>
    </form>
  );
}
