"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PenSquare, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export function CreatePost(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(fileName);

    return publicUrl;
  }

  async function onSubmit(): Promise<void> {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from("posts").insert({
        content,
        user_id: user.id,
        image_url: imageUrl,
      });

      if (error) throw error;

      setContent("");
      setImageFile(null);
      setPreviewUrl(null);
      setIsOpen(false);
      router.refresh();
      toast.success("Post created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage(): void {
    setImageFile(null);
    setPreviewUrl(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
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

          {previewUrl && (
            <div className="relative">
              <Image
                src={previewUrl}
                alt="Preview"
                width={400}
                height={300}
                className="rounded-md object-cover"
              />
              <Button
                variant="ghost"
                className="absolute top-2 right-2 hover:bg-accent"
                onClick={removeImage}
              >
                Remove Image
              </Button>
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="default"
              className="gap-2"
              onClick={() => imageInputRef.current?.click()}
              type="button"
            >
              <ImagePlus className="h-5 w-5" />
              <span>Add Image</span>
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <Button
              onClick={onSubmit}
              disabled={isLoading || (!content.trim() && !imageFile)}
            >
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
