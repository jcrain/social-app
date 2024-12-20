"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";

export function AuthProvider(): null {
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      supabase.auth.setSession({
        access_token: session?.access_token || null,
        refresh_token: session?.refresh_token || null,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
    });
  }, [supabase.auth]);

  return null;
}
