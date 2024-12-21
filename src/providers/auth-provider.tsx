"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { AuthSession, Session } from "@supabase/supabase-js";

export function AuthProvider(): null {
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await supabase.auth.setSession(session);
      }
    });
  }, [supabase.auth]);

  return null;
}
