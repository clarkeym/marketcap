"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createPost } from "@/app/actions/community";

export function CommunityPostComposer() {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit() {
    const trimmed = body.trim();
    if (trimmed.length === 0) return;

    startTransition(async () => {
      try {
        await createPost({ body: trimmed });
        setBody("");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to post");
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your take on the market..."
          maxLength={500}
          rows={3}
          className="w-full resize-none rounded-lg border bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{body.length}/500</span>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={isPending || body.trim().length === 0}>
            {isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
