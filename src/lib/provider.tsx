"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";

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
