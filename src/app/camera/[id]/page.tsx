"use client";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import { decode } from "base64-arraybuffer";
import { Play, SwitchCameraIcon, Camera, User } from "lucide-react";
import axios from "axios";
import { UploadData } from "@/app/api/v1/upload/route";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase";
import moment from "moment";
import { ImageModel, EventModel } from "../../../../types";
import { rubiks } from "@/lib/fonts";

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

const CameraView = (props: { eventId: string }) => {
  const camera = useRef<Webcam>(null);
  const session = useSession();

  const { mutateAsync: takePicture } = useMutation({
    mutationFn: async () => {
      const img = camera.current?.getScreenshot();
      window.navigator.vibrate(200);
      if (img) {
        const uploadData: UploadData = {
          image: img,
          eventId: props.eventId,
          userId: session?.user.id ?? '',
        };
        await axios.post("/api/v1/upload", uploadData);
      }
    },
  });

  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      <Webcam
        className="h-full w-full border-2 border-slate-400"
        height={1020}
        ref={camera}
        screenshotFormat="image/jpeg"
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

function ComponentTitle(props: { eventId: string }) {
  const { data: people, isFetching: loading } = useQuery({
    queryKey: [props.eventId + "people"],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/people/?id=${props.eventId}`)
        .then((res) => res.data)) as ImageModel[],
    staleTime: 6 * 1000,
    refetchInterval: 6 * 1000,
  });

  const { data: images, isFetching: ImagesLoading } = useQuery({
    queryKey: [props.eventId + props.eventId + "images"],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/images/?id=${props.eventId}`)
        .then((res) => res.data)) as ImageModel[],
    staleTime: 6 * 1000,
    refetchInterval: 6 * 1000,
  });

  const { data: event, isFetching: isLoading } = useQuery({
    queryKey: [props.eventId],
    queryFn: async () =>
      (await axios
        .get(`/api/v1/event/?id=${props.eventId}`)
        .then((res) => res.data)) as EventModel,
  });

  return (
    <div className=" w-full p-8 justify-start items-start ">
      <h2 className={`text-white font-bold text-4xl ${rubiks.className}`}>
        {event?.name}
      </h2>
      <p className={`text-white font-bold text-base ${rubiks.className}`}>
        {moment(event?.createdAt.toString()).format("ll")}
      </p>
      <div className="flex flex-row gap-3 justify-start items-center my-3">
        <div className="flex flex-row gap-2 justify-start items-center">
          <Camera size={18} />
          <h2 className="text-white  text-base">{images?.length}</h2>
        </div>
        <div className="flex flex-row gap-2 justify-start items-center">
          <User size={18} />
          <h2 className="text-white  text-base">{people?.length}</h2>
        </div>
      </div>
    </div>
  );
}

export default function CameraPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex items-center justify-center w-full h-full bg-neutral-900">
      <main className="flex min-h-screen h-full sm:w-auto md:max-w-2xl w-full flex-col items-center justify-start bg-transparent text-white">
        <ComponentTitle eventId={params.id} />
        <CameraView eventId={params.id} />
      </main>
    </div>
  );
}
