"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPost(input: { body: string; symbol?: string }) {
  const body = input.body.trim();
  if (body.length === 0 || body.length > 500) {
    throw new Error("Post must be between 1 and 500 characters.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("community_posts").insert({
    user_id: user.id,
    symbol: input.symbol ? input.symbol.toUpperCase() : null,
    body,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/community");
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/community");
}

export async function toggleLike(postId: string, isLiked: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  if (isLiked) {
    const { error } = await supabase
      .from("community_post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("community_post_likes")
      .insert({ post_id: postId, user_id: user.id });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/community");
}
