"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { EventModel } from "@/app/types";
import { supabase } from "@/app/supabase";
import { decode } from "base64-arraybuffer";
import { Play, SwitchCameraIcon } from "lucide-react";
import axios from "axios";
import { UploadData } from "@/app/api/v1/photo/route";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useSession } from "@supabase/auth-helpers-react";
import LoginPage from "@/app/login/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

export type ImageModel = {
  id: string;
  name: string;
  userId: string;
  eventId: string;
  url: string;
  createdAt: string;
};

export default function CameraPage({ params }: { params: { id: string } }) {
  const returnToUrl = window.location.href;

  const camera = useRef<Webcam>(null);
  const session = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  async function loginWithGoogle() {
    await supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: returnToUrl,
        },
      })
      .then((res) => {
        console.log(res);
      });
  }

  const { data: events, isFetching: isLoading } = useQuery({
    queryKey: [params.id],
    queryFn: async () =>
      await axios.get(`/api/v1/event/?id=${params.id}`).then((res) => res.data),
  });

  const { data: images, isFetching: loading } = useQuery({
    queryKey: [params.id + "images"],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/photo/?id=${params.id}`)
        .then((res) => res.data)) as ImageModel[],
    staleTime: 6 * 1000,
    refetchInterval: 6 * 1000,
  });

  const { mutateAsync: takePicture } = useMutation({
    mutationFn: async () => {
      const img = camera.current?.getScreenshot();
      // soft vibrate
      window.navigator.vibrate(100);
      if (img) {
        const uploadData: UploadData = {
          image: img,
          eventId: params.id,
          userId: session?.user.id as string,
        };
        await axios.post("/api/v1/photo", uploadData);
      }
    },
  });

  async function switchCamera() {
    const video = camera.current?.video;
    if (video) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      video.srcObject = stream;
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#121212] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 py-16 ">
        <Webcam
          // className="h-full w-full"
          height={1020}
          ref={camera}
          screenshotFormat="image/jpeg"
          width={1380}
          videoConstraints={{
            width: 1024,
            height: 1024,
            facingMode: "environment",
          }}
        />
      </div>
      <div className="flex flex-row items-center">
        <div className="border-2 rounded-full border-orange-600 mx-8">
          <div
            className="h-16 w-16 bg-slate-400 rounded-full m-1"
            onClick={async () => {
              if (session) {
                return toast({
                  title: "Error",
                  description: "You need to be logged in to take a picture",
                  status: "error",
                  variant: "destructive",
                  duration: 5000,
                  isClosable: true,
                  action: (
                    <ToastAction
                      altText="Login"
                      onClick={() => loginWithGoogle()}
                    >
                      Login
                    </ToastAction>
                  ),
                });
              }
              await takePicture();
            }}
          ></div>
        </div>

        {/* <Button variant="outline" size="icon" className="bg-gray-700">
          <SwitchCameraIcon className="h-4 w-4" />
        </Button> */}
      </div>
      <div className="flex flex-row overflow-x-auto py-10 h-44">
        {images?.map((image) => (
          <Image
            key={image.id}
            alt={image.name}
            src={image.url}
            width={80}
            height={80}
            className="mx-1 border-2 border-gray-700 rounded-md"
          />
        ))}
      </div>
    </main>
  );
}

function AuthDialog() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
