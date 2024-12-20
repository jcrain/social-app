"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: string;
  userId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export function CommentForm({
  postId,
  userId,
  parentId,
  onSuccess,
}: CommentFormProps): JSX.Element {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function onSubmit(): Promise<void> {
    try {
      setIsLoading(true);
      const { error } = await supabase.from("comments").insert({
        content,
        post_id: postId,
        user_id: userId,
        parent_id: parentId,
      });

      if (error) throw error;

      setContent("");
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={isLoading || !content.trim()}>
          {isLoading ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}
