"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { LikeButton } from "@/components/like-button";
import { CommentForm } from "@/components/comment-form";
import { CommentCard } from "@/components/comment-card";
import { Post } from "@/lib/types";
import { Session } from "@supabase/auth-helpers-nextjs";

interface PostCardProps {
  post: Post & { isLiked: boolean };
  session: Session | null;
}

export function PostCard({ post, session }: PostCardProps): JSX.Element {
  const [showCommentForm, setShowCommentForm] = useState(false);

  function formatDate(dateString: string): string {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  }

  return (
    <Card className="border-b hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
      <CardHeader className="flex flex-row gap-4 space-y-0">
        <Avatar>
          <AvatarImage
            src={post.profiles?.avatar_url}
            alt={post.profiles?.full_name}
          />
          <AvatarFallback>{post.profiles?.full_name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{post.profiles?.full_name}</span>
            <span className="text-sm text-muted-foreground">
              @{post.profiles?.username}
            </span>
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(post.created_at)}
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
            initialLikes={post.likes.length}
            initialIsLiked={post.isLiked || false}
          />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments?.length || 0}</span>
          </Button>
        </div>

        {showCommentForm && session?.user && (
          <div className="mt-4">
            <CommentForm
              postId={post.id}
              userId={session.user.id}
              onSuccess={() => setShowCommentForm(false)}
            />
          </div>
        )}

        {post.comments?.length > 0 && (
          <div className="mt-4 space-y-4">
            {post.comments
              .filter((comment) => !comment.parent_id)
              .map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={{
                    ...comment,
                    replies: post.comments.filter(
                      (reply) => reply.parent_id === comment.id
                    ),
                  }}
                  postId={post.id}
                  userId={session?.user?.id}
                  isLiked={comment.likes?.some(
                    (like) => like.user_id === session?.user?.id
                  )}
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
