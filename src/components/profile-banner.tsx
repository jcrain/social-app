"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pencil, Camera } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface ProfileBannerProps {
  userId: string;
  bannerUrl: string | null;
  avatarUrl: string;
  isOwner?: boolean;
}

export function ProfileBanner({
  userId,
  bannerUrl,
  avatarUrl,
  isOwner = false,
}: ProfileBannerProps): JSX.Element {
  const [isUploading, setIsUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  async function uploadImage(
    file: File,
    bucket: "banners" | "avatars"
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${
      bucket === "banners" ? "banner" : "avatar"
    }.${fileExt}`;

    // Delete old file if it exists
    const oldUrl = bucket === "banners" ? bannerUrl : avatarUrl;
    if (oldUrl) {
      const oldFileName = oldUrl.split("/").pop();
      if (oldFileName) {
        await supabase.storage.from(bucket).remove([oldFileName]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "avatar"
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

      const bucket = type === "banner" ? "banners" : "avatars";
      const publicUrl = await uploadImage(file, bucket);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          [type === "banner" ? "banner_url" : "avatar_url"]: publicUrl,
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success(
        `${type === "banner" ? "Banner" : "Avatar"} updated successfully`
      );
      router.refresh();
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Error uploading ${type}`);
    } finally {
      setIsUploading(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={
            bannerUrl ||
            "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e"
          }
          alt="Profile banner"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
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
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e, "banner")}
          disabled={isUploading}
        />
        <Button
          variant="default"
          size="icon"
          className="absolute right-4 top-4 h-8 w-8"
          disabled={isUploading}
          onClick={() => bannerInputRef.current?.click()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Avatar upload button */}
      <div className="absolute -bottom-16 left-4">
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e, "avatar")}
          disabled={isUploading}
        />
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
          disabled={isUploading}
          onClick={() => avatarInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
