"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PenSquare } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreatePost(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function onSubmit(): Promise<void> {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("posts").insert({
        content,
        user_id: user.id,
      });

      if (error) throw error;

      setContent("");
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="gap-2">
          <PenSquare className="h-4 w-4" />
          New Post
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96">
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[100px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={isLoading || !content.trim()}>
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
