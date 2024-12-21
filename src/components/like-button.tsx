"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: string;
  userId?: string;
  initialLikes: number;
  initialIsLiked: boolean;
}

export function LikeButton({
  postId,
  userId,
  initialLikes,
  initialIsLiked,
}: LikeButtonProps): JSX.Element {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function toggleLike(): Promise<void> {
    try {
      if (!userId) {
        router.push("/login");
        return;
      }

      setIsLoading(true);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("likes")
          .delete()
          .match({ user_id: userId, post_id: postId });

        if (error) throw error;

        setLikes((prev) => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from("likes")
          .insert({ user_id: userId, post_id: postId });

        if (error) throw error;

        setLikes((prev) => prev + 1);
        setIsLiked(true);
      }

      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="default"
      className="gap-1 -ml-3"
      disabled={isLoading}
      onClick={toggleLike}
    >
      <Heart
        className={`w-5 h-5 ${
          isLiked ? "fill-red-500 text-red-500" : "text-gray-500"
        }`}
      />
      <span>{likes}</span>
    </Button>
  );
}
