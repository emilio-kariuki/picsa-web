"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const supabaseUrl = 'https://pvotaaukwfeabaqtahfu.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2b3RhYXVrd2ZlYWJhcXRhaGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5OTQwMDcsImV4cCI6MjAxODU3MDAwN30.Xv5gQJklMkH9NKq222NHYdGLlE722QemDe8__Bg2pl4';
  const [supabaseClient] = useState<SupabaseClient>(() =>
    createClient(supabaseUrl, supabaseKey)
  );
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <SessionContextProvider supabaseClient={supabaseClient}>
        {children}
      </SessionContextProvider>
    </QueryClientProvider>
  );
}
