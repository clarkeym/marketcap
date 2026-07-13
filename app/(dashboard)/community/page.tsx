import { createClient } from "@/lib/supabase/server";
import { CommunityFeed } from "@/components/community/community-feed";
import { CommunityPostComposer } from "@/components/community/community-post-composer";
import type { FeedPost } from "@/components/community/community-post-card";

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, user_id, symbol, body, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const userIds = Array.from(new Set((posts ?? []).map((p) => p.user_id)));
  const postIds = (posts ?? []).map((p) => p.id);

  let profiles: { id: string; display_name: string | null }[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from("profiles").select("id, display_name").in("id", userIds);
    profiles = data ?? [];
  }

  let likes: { post_id: string; user_id: string }[] = [];
  if (postIds.length > 0) {
    const { data } = await supabase
      .from("community_post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);
    likes = data ?? [];
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p.display_name]));
  const likesByPost = new Map<string, string[]>();
  likes.forEach((like) => {
    const arr = likesByPost.get(like.post_id) ?? [];
    arr.push(like.user_id);
    likesByPost.set(like.post_id, arr);
  });

  const feedPosts: FeedPost[] = (posts ?? []).map((post) => ({
    id: post.id,
    body: post.body,
    symbol: post.symbol,
    createdAt: post.created_at,
    authorName: profileMap.get(post.user_id) || "MarketCap user",
    isOwn: post.user_id === user!.id,
    likeCount: likesByPost.get(post.id)?.length ?? 0,
    isLiked: likesByPost.get(post.id)?.includes(user!.id) ?? false,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Community</h1>
        <p className="text-muted-foreground">See what other investors are posting.</p>
      </div>
      <CommunityPostComposer />
      <CommunityFeed posts={feedPosts} />
    </div>
  );
}
