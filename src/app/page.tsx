"use client";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import Webcam from "react-webcam";
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <Webcam />;
        <Button>take a picture</Button>
      </div>
    </main>
  );
}
