"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton(): JSX.Element {
  const router = useRouter();
  const supabase = createClientComponentClient();

  async function handleLogout(): Promise<void> {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <Button variant="ghost" size="default" onClick={handleLogout}>
      <LogOut className="h-5 w-5" />
    </Button>
  );
}
