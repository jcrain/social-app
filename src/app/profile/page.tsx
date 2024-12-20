import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileBanner } from "@/components/profile-banner";
import { ProfileTabs } from "@/components/profile-tabs";

interface PostWithLike {
  likes: { user_id: string }[];
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  comments: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string;
      avatar_url: string;
    };
  }[];
}

const addIsLiked = (
  posts: PostWithLike[],
  session: { user: { id: string } } | null
): (PostWithLike & { isLiked: boolean })[] =>
  posts?.map((post) => ({
    ...post,
    isLiked: post.likes.some(
      (like: { user_id: string }) => like.user_id === session?.user.id
    ),
  }));

export default async function ProfilePage(): Promise<JSX.Element> {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // First, get the post IDs for comments and likes
  const [postsData, { data: commentedPostIds }, { data: likedPostIds }] =
    await Promise.all([
      // Get user's posts
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
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false }),

      // Get post IDs user has commented on
      supabase
        .from("comments")
        .select("post_id")
        .eq("user_id", session.user.id),

      // Get post IDs user has liked
      supabase.from("likes").select("post_id").eq("user_id", session.user.id),
    ]);

  // Then fetch the actual posts for comments and likes
  const [commentsData, likesData] = await Promise.all([
    // Get posts user has commented on
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
      .in(
        "id",
        (commentedPostIds || []).map((row) => row.post_id)
      )
      .order("created_at", { ascending: false }),

    // Get posts user has liked
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
      .in(
        "id",
        (likedPostIds || []).map((row) => row.post_id)
      )
      .order("created_at", { ascending: false }),
  ]);

  const posts = addIsLiked(postsData.data || [], session);
  const comments = addIsLiked(commentsData.data || [], session);
  const likes = addIsLiked(likesData.data || [], session);

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileBanner
        userId={session.user.id}
        bannerUrl={profile.banner_url}
        avatarUrl={profile.avatar_url}
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
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">{session.user.email}</p>
                </div>
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
