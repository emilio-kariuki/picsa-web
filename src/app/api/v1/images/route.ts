import { supabase } from "@/app/supabase";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");

  const { data: image, error } = await supabase
    .from("Images")
    .select("*")
    .eq("eventId", id)
    .order("createdAt", { ascending: false })
    .single();

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(image), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

