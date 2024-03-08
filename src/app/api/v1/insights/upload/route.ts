import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";
import { NextRequest, NextResponse } from "next/server";

type InsightData = {
image: string;
}

export const POST = async (req: NextRequest) => {
  const data: InsightData = await req.json();
console.log(data)
   const time: number = new Date().valueOf();
   const imageKey: string = `insights/${time}.jpg`;
  const splitImage = data.image;
  const imageData = decode(splitImage);
  console.log(imageData)
  const { error: uploadError } = await supabase.storage
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

  return new NextResponse(JSON.stringify({
image: imageUrl
  }));
};
