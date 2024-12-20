"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  created_at: string;
  type: "like" | "comment" | "reply";
  read: boolean;
  actor: {
    username: string;
    full_name: string;
  };
  post: {
    content: string;
  };
}

export function NotificationDropdown(): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchNotifications(): Promise<void> {
      const { data } = await supabase
        .from("notifications")
        .select(
          `
          *,
          actor:actor_id(username, full_name),
          post:post_id(content)
        `
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    }

    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload): void => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return (): void => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function markAsRead(notificationId: string): Promise<void> {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => prev - 1);
  }

  function getNotificationText(notification: Notification): string {
    switch (notification.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "reply":
        return "replied to your comment";
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start gap-1 p-4 ${
                !notification.read ? "bg-muted/50" : ""
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-center gap-1">
                <span className="font-semibold">
                  {notification.actor.full_name}
                </span>
                <span>{getNotificationText(notification)}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {notification.post.content}
              </p>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
