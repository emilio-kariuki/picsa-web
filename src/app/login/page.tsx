"use client";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import google from "@/assets/google.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const supabase = useSupabaseClient();

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" }).then((res) => {
      console.log(res);
    });
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-4xl font-bold">Login</h1>
        <div className="flex flex-col items-center justify-center gap-4">
          <Button onClick={loginWithGoogle}>
            <Image src={google} alt="google" className="w-6 h-6" />
            <span>Google</span>
          </Button>
        </div>
      </div>
    </main>
  );
}
