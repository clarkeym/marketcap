"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { deletePost, toggleLike } from "@/app/actions/community";

export type FeedPost = {
  id: string;
  body: string;
  symbol: string | null;
  createdAt: string;
  authorName: string;
  isOwn: boolean;
  likeCount: number;
  isLiked: boolean;
};

export function CommunityPostCard({ post }: { post: FeedPost }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLike() {
    startTransition(async () => {
      try {
        await toggleLike(post.id, post.isLiked);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to update like");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deletePost(post.id);
        router.refresh();
        toast.success("Post deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete post");
      }
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>{post.authorName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.authorName}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
            </div>
          </div>
          {post.symbol && <Badge variant="outline">{post.symbol}</Badge>}
        </div>
        <p className="text-sm">{post.body}</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleLike} disabled={isPending} className="gap-1.5">
            <Heart className={cn("size-4", post.isLiked && "fill-current text-red-500")} />
            {post.likeCount > 0 ? post.likeCount : ""}
          </Button>
          {post.isOwn && (
            <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
