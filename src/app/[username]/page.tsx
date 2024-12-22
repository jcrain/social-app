import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileBanner } from "@/components/profile-banner";
import { ProfileTabs } from "@/components/profile-tabs";
import { Post } from "@/lib/types";

export default async function ProfilePage({
  params: { username },
}: {
  params: { username: string };
}): Promise<JSX.Element> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get profile by username
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", decodeURIComponent(username))
    .single();

  if (!profile) {
    notFound();
  }

  // Get posts, comments, and likes
  const [postsData, commentsData, likesData] = await Promise.all([
    supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url),
        comments (
          id, content, created_at,
          profiles:user_id (username, full_name, avatar_url)
        ),
        likes (user_id)
      `
      )
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url),
        comments (
          id, content, created_at,
          profiles:user_id (username, full_name, avatar_url)
        ),
        likes (user_id)
      `
      )
      .in("id", [
        await supabase
          .from("comments")
          .select("post_id")
          .eq("user_id", profile.id)
          .then(({ data }) => data?.map((row) => row.post_id) || []),
      ])
      .order("created_at", { ascending: false }),

    supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (username, full_name, avatar_url),
        comments (
          id, content, created_at,
          profiles:user_id (username, full_name, avatar_url)
        ),
        likes (user_id)
      `
      )
      .in("id", [
        await supabase
          .from("likes")
          .select("post_id")
          .eq("user_id", profile.id)
          .then(({ data }) => data?.map((row) => row.post_id) || []),
      ])
      .order("created_at", { ascending: false }),
  ]);

  const addIsLiked = (
    posts: Post[],
    userId?: string
  ): (Post & { isLiked: boolean })[] =>
    posts?.map((post) => ({
      ...post,
      isLiked: post.likes.some(
        (like: { user_id: string }) => like.user_id === userId
      ),
    })) || [];

  const posts = addIsLiked(postsData.data || [], session?.user.id);
  const comments = addIsLiked(commentsData.data || [], session?.user.id);
  const likes = addIsLiked(likesData.data || [], session?.user.id);

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileBanner
        userId={profile.id}
        bannerUrl={profile.banner_url}
        avatarUrl={profile.avatar_url}
        isOwner={session?.user.id === profile.id}
      />

      <div className="max-w-2xl mx-auto px-4">
        <div className="relative -mt-20">
          <Card className="border-t">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pt-20">
              <Avatar className="h-32 w-32 absolute -top-16 border-4 border-background">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-36">
                <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Member since</h3>
                  <p className="text-muted-foreground">
                    {new Date(profile.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ProfileTabs
          posts={posts}
          comments={comments}
          likes={likes}
          session={session}
        />
      </div>
    </div>
  );
}
