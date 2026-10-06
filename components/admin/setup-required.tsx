import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupRequired({ missing }: { missing: string[] }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Finish setup to manage hero images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>This project is missing: {missing.join(", ")}.</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>In the Vercel project, open the Storage tab.</li>
          <li>Create a Postgres database and connect it to this project.</li>
          <li>Create a Blob store and connect it to this project.</li>
          <li>
            Set <code className="rounded bg-muted px-1 py-0.5">ADMIN_PASSWORD</code> and{" "}
            <code className="rounded bg-muted px-1 py-0.5">SESSION_SECRET</code> in Project
            Settings → Environment Variables.
          </li>
          <li>Redeploy.</li>
        </ol>
      </CardContent>
    </Card>
  );
}
