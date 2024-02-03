"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { supabase } from "@/app/supabase";

export function Providers({ children }: { children: React.ReactNode }) {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <SessionContextProvider supabaseClient={supabase}>
        {children}
      </SessionContextProvider>
    </QueryClientProvider>
  );
}
