import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({ title, description, phase }: { title: string; description: string; phase: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>{phase}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This section is scaffolded and wired into the nav, but the data and UI land in a later
          build phase.
        </CardContent>
      </Card>
    </div>
  );
}
