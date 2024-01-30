"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
export default function HomePage() {
  const camera = useRef<Webcam>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <Webcam
          audio={false}
          height={720}
          ref={camera}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: "environment",
          }}
        />
        ;<Button>take a picture</Button>
      </div>
    </main>
  );
}
