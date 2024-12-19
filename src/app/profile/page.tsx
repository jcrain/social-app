import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProfileBanner } from "@/components/profile-banner";
import { LikeButton } from "@/components/like-button";

export default async function ProfilePage() {
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
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  const postsWithLikes = posts?.map((post) => ({
    ...post,
    isLiked: post.likes.some((like) => like.user_id === session?.user.id),
    likes: post.likes.length,
  }));

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileBanner userId={session.user.id} bannerUrl={profile.banner_url} />

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

        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">Posts</h2>
          {postsWithLikes?.length === 0 ? (
            <p className="text-muted-foreground">No posts yet</p>
          ) : (
            postsWithLikes?.map((post) => (
              <Card key={post.id}>
                <CardHeader className="flex flex-row gap-4 space-y-0">
                  <Avatar>
                    <AvatarImage
                      src={post.profiles.avatar_url}
                      alt={post.profiles.full_name}
                    />
                    <AvatarFallback>
                      {post.profiles.full_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {post.profiles.full_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        @{post.profiles.username}
                      </span>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{post.content}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mt-2">
                    <LikeButton
                      postId={post.id}
                      userId={session?.user.id}
                      initialLikes={post.likes}
                      initialIsLiked={post.isLiked}
                    />
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.comments?.length || 0}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
