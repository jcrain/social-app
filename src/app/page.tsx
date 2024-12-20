import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Post } from "@/lib/types";
import { PostCard } from "@/components/post-card";

interface Like {
  user_id: string;
}

interface PostWithLikes extends Post {
  isLiked: boolean;
}

export default async function Home(): Promise<JSX.Element> {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles:user_id (
        username,
        full_name,
        avatar_url
      ),
      comments (
        id,
        content,
        created_at,
        profiles:user_id (
          username,
          full_name,
          avatar_url
        )
      ),
      likes (
        user_id
      )
    `
    )
    .order("created_at", { ascending: false });

  const postsWithLikes = posts?.map(
    (post): PostWithLikes => ({
      ...post,
      isLiked: post.likes.some(
        (like: Like) => like.user_id === session?.user.id
      ),
    })
  );

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Home</h1>
      <div className="flex flex-col gap-1">
        {postsWithLikes?.map((post) => (
          <PostCard key={post.id} post={post} session={session} />
        ))}
      </div>
    </main>
  );
}
