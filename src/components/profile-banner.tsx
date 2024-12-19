"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pencil } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface ProfileBannerProps {
  userId: string;
  bannerUrl: string | null;
}

export function ProfileBanner({
  userId,
  bannerUrl,
}: ProfileBannerProps): JSX.Element {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  function handleButtonClick(): void {
    fileInputRef.current?.click();
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Upload image to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-banner.${fileExt}`;

      // Delete old banner if it exists
      if (bannerUrl) {
        const oldFileName = bannerUrl.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("banners").remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("banners")
        .getPublicUrl(fileName);

      // Update profile with new banner URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ banner_url: publicUrl.publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Banner updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error("Error uploading banner");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="relative h-48 md:h-64 w-full group">
      <Image
        src={
          bannerUrl ||
          "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1470&fit=crop&auto=format"
        }
        alt="Profile banner"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-4 h-8 w-8"
          disabled={isUploading}
          onClick={handleButtonClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
