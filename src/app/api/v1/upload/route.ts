import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";

export type UploadData = {
  image: string;
  userId: string;
  eventId: string;
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: UploadData = await req.json();
  const time: number = new Date().valueOf();
  const imageKey: string = `web/${time}.jpg`;
  const splitImage = data.image.split(",")[1];
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

  const imageUrl = supabase.storage.from("picsa").getPublicUrl(imageKey)
    .data.publicUrl;
  const response = await prisma.images.create({
    data: {
      id: uuidv4(),
      name: imageKey,
      url: imageUrl,
      userId: data.userId,
      eventId: data.eventId,
    }
  });


  if (!response) {
    return new NextResponse(JSON.stringify("Error uploading"));
  }

  return new NextResponse(JSON.stringify(response));
};
