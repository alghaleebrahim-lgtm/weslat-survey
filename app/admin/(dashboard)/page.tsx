import Link from "next/link";

import { hasDatabase, listHeroImages } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SetupRequired } from "@/components/admin/setup-required";

export default async function AdminOverviewPage() {
  if (!hasDatabase) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          Overview
        </h1>
        <SetupRequired missing={["a database (POSTGRES_URL / DATABASE_URL)"]} />
      </div>
    );
  }

  const images = await listHeroImages();
  const active = images.filter((image) => image.isActive).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-medium tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the homepage hero image collection.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total images
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{images.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active on homepage
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{active}</CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Manage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/admin/hero" />}>Go to Hero Images</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
