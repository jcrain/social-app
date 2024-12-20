"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { CommentForm } from "./comment-form";

interface CommentCardProps {
  comment: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      username: string;
      full_name: string;
      avatar_url: string;
    };
    likes: { user_id: string }[];
    replies?: CommentCardProps["comment"][];
  };
  postId: string;
  userId?: string;
  isLiked?: boolean;
  level?: number;
}

export function CommentCard({
  comment,
  postId,
  userId,
  isLiked: initialIsLiked = false,
  level = 0,
}: CommentCardProps): JSX.Element {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function toggleLike(): Promise<void> {
    if (!userId) return;

    try {
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

      if (isLiked) {
        await supabase
          .from("comment_likes")
          .delete()
          .match({ user_id: userId, comment_id: comment.id });
      } else {
        await supabase
          .from("comment_likes")
          .insert({ user_id: userId, comment_id: comment.id });
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount + 1 : likesCount - 1);
    }
  }

  return (
    <div className={`flex gap-3 ${level > 0 ? "ml-8" : ""}`}>
      <Avatar className="w-6 h-6">
        <AvatarImage src={comment.profiles?.avatar_url} />
        <AvatarFallback>{comment.profiles?.full_name?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {comment.profiles?.full_name}
          </span>
          <span className="text-xs text-muted-foreground">
            @{comment.profiles?.username}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
        <div className="flex gap-2 mt-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={toggleLike}
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-current text-red-500" : ""
              }`}
            />
            <span className="text-xs">{likesCount}</span>
          </Button>
          {level < 2 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
        </div>

        {showReplyForm && userId && (
          <div className="mt-2">
            <CommentForm
              postId={postId}
              userId={userId}
              parentId={comment.id}
              onSuccess={() => setShowReplyForm(false)}
            />
          </div>
        )}

        {comment.replies?.map((reply) => (
          <div key={reply.id} className="mt-2">
            <CommentCard
              comment={reply}
              postId={postId}
              userId={userId}
              isLiked={reply.likes?.some((like) => like.user_id === userId)}
              level={level + 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
