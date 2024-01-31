"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { EventModel } from "@/app/types";
import { supabase } from "@/app/supabase";

export default function CameraPage({ params }: { params: { id: string } }) {
  const camera = useRef<Webcam>(null);
  const [event, setEvent] = useState<EventModel>();

  async function getEvent() {
    const res = await supabase.from("Events").select().eq("id", params.id).single();
    const data = res.data as EventModel;
    setEvent(data);
  }

  useEffect(()=>{
    getEvent();
  })

  async function takePicture() {
    const img = camera.current?.getScreenshot();
    if (img) {
      
    }
  }

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
        <Button >{event?.userId}</Button>
        
      </div>
    </main>
  );
}
