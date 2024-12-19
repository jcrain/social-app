import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { CreatePost } from "@/components/create-post";

export async function Nav() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: profile } = session
    ? await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()
    : { data: null };

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-bold text-xl hover:text-primary transition-colors"
            >
              SuperCool Chat
            </Link>
            {profile && <CreatePost />}
          </div>

          <div className="flex items-center gap-4">
            {profile ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="hover:opacity-75 transition-opacity flex items-center gap-2"
                >
                  <span className="text-sm">@{profile.username}</span>
                  <Avatar>
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.full_name}
                    />
                    <AvatarFallback>{profile.full_name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
