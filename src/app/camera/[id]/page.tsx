"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { EventModel } from "@/app/types";
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
import { supabase } from "@/app/supabase";
import { Rubik_Bubbles } from "next/font/google";

const quicksand = Rubik_Bubbles({
  weight: "400",
  style: "normal",
  subsets: ["cyrillic"],
});

export type ImageModel = {
  id: string;
  name: string;
  userId: string;
  eventId: string;
  url: string;
  createdAt: string;
};

function CaptureComponents(props: {
  takePicture: () => void;
  eventId: string;
}) {
  const session = useSession();
  const { toast } = useToast();
  const returnToUrl = window.location.href;

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

  return (
    <div className="flex h-16 w-16 border-2 rounded-full border-orange-600 p-1">
      <div
        className="h-full w-full bg-slate-400 rounded-full "
        onClick={async () => {
          if (!session) {
            return toast({
              title: "You are not logged in",
              description: "You need to be logged in to take a picture",
              action: (
                <ToastAction altText="Login" onClick={() => loginWithGoogle()}>
                  Login
                </ToastAction>
              ),
            });
          }
          {
            props.takePicture;
          }
        }}
      ></div>
    </div>
  );
}

const Camera = (props: { eventId: string }) => {
  const camera = useRef<Webcam>(null);
  const session = useSession();

  const { mutateAsync: takePicture } = useMutation({
    mutationFn: async () => {
      const img = camera.current?.getScreenshot();
      window.navigator.vibrate(100);
      if (img) {
        const uploadData: UploadData = {
          image: img,
          eventId: props.eventId,
          userId: session?.user.id as string,
        };
        await axios.post("/api/v1/photo", uploadData);
      }
    },
  });

  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <Webcam
        className="h-full w-full border-2"
        height={1020}
        ref={camera}
        screenshotFormat="image/jpeg"
        // width={1380}
        videoConstraints={{
          width: 1024,
          height: 1024,
          facingMode: "environment",
        }}
      />
      <CaptureComponents takePicture={takePicture} eventId={props.eventId} />
    </div>
  );
};

export default function CameraPage({ params }: { params: { id: string } }) {
  const { data: event, isFetching: isLoading } = useQuery({
    queryKey: [params.id],
    queryFn: async () =>
      await axios.get(`/api/v1/event/?id=${params.id}`).then((res) => res.data),
  });

  return (
    <div className="flex items-center justify-center w-full h-full bg-neutral-900">
<main className="flex min-h-screen h-full sm:w-auto md:max-w-2xl w-full flex-col items-center justify-start bg-transparent text-white">
      <ComponentTitle eventId={params.id} />
      <Camera eventId={params.id} />
      <PlayBanner />
    </main>
    </div>
  );
}

function ImagesList(props: { eventId: string }) {
  const { data: images, isFetching: loading } = useQuery({
    queryKey: [props.eventId + "images"],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/photo/?id=${props.eventId}`)
        .then((res) => res.data)) as ImageModel[],
    staleTime: 6 * 1000,
    refetchInterval: 6 * 1000,
  });

  return (
    <div className="flex flex-row overflow-x-hidden py-10 h-44 relative">
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
  );
}
// bottom banner to tell them to download the app from playstore

function PlayBanner() {
  return (
    <div
      className="flex md:max-w-2xl w-full justify-center items-center h-10 bg-green-500 absolute bottom-0"
      onClick={() => {
        window.open(
          "https://play.google.com/store/apps/details?id=com.ecoville.picsa"
        );
      }}
    >
      <Play size={24} className="mx-3" />
      <p>Download the app from playstore</p>
    </div>
  );
}
function ComponentTitle(props: { eventId: string }) {

  return (
    <div className=" w-full p-8 justify-start items-start">
      <h1 className={`text-white font-bold text-4xl ${quicksand.style}`}>
        Picsa Pro
      </h1>
      <p>No Hassle, No Paperwork, Just Picsa</p>
    </div>
  );
}
