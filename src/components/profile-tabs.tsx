"use client";

import { Post } from "@/lib/types";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { PostCard } from "./post-card";
import { Button } from "./ui/button";
import { MessageSquare, Heart, Send } from "lucide-react";

interface ProfileTabsProps {
  posts: (Post & { isLiked: boolean })[];
  comments: (Post & { isLiked: boolean })[];
  likes: (Post & { isLiked: boolean })[];
  session: Session | null;
}

export function ProfileTabs({
  posts,
  comments,
  likes,
  session,
}: ProfileTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<"posts" | "comments" | "likes">(
    "posts"
  );

  const tabs = [
    { id: "posts", label: "Posts", icon: Send, content: posts },
    {
      id: "comments",
      label: "Comments",
      icon: MessageSquare,
      content: comments,
    },
    { id: "likes", label: "Likes", icon: Heart, content: likes },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`gap-2 pb-4 rounded-none ${
                activeTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      <div className="space-y-4">
        {tabs.find((tab) => tab.id === activeTab)?.content.length === 0 ? (
          <p className="text-muted-foreground">No {activeTab} yet</p>
        ) : (
          tabs
            .find((tab) => tab.id === activeTab)
            ?.content.map((post) => (
              <PostCard key={post.id} post={post} session={session} />
            ))
        )}
      </div>
    </div>
  );
}
