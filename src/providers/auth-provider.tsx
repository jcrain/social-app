"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { AuthSession } from "@supabase/supabase-js";

export function AuthProvider(): null {
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session: AuthSession | null) => {
      supabase.auth.setSession({
        access_token: session?.access_token || undefined,
        refresh_token: session?.refresh_token || undefined,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
      });
    });
  }, [supabase.auth]);

  return null;
}
