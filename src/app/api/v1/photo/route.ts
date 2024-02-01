import { supabase } from "@/app/supabase";
import { decode } from "base64-arraybuffer";
import { log } from "console";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export type UploadData = {
  image: string;
  userId: string;
  eventId: string;
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: UploadData = await req.json();
  const time: number = new Date().valueOf();
  const imageKey: string = `web/${time}.jpg`;
  const splitImage = data.image.split("base64,")[1];
  const imageData = decode(splitImage);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("picsa")
    .upload(imageKey, imageData, {
      cacheControl: "3600",
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return new NextResponse(JSON.stringify(uploadError));
  }
  console.log('====================================');
  console.log(data.userId);
  console.log('====================================');
  const imageUrl = (supabase.storage.from("picsa").getPublicUrl(imageKey)).data.publicUrl;
  const { data: photo, error } = await supabase.from("Images").insert({
    id: uuidv4(),
    name: imageKey,
    url: imageUrl,
    userId: data.userId,
    eventId: data.eventId,
  });

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(photo));
};

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data: photos, error } = await supabase
    .from("Images")
    .select("*")
    .eq("eventId", id)
    .order("createdAt", { ascending: false });


  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(photos));
};
