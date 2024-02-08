import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("user");

  const { data: image, error } = await supabase
    .from("Images")
    .select("*")
    .eq("userId", id)
    .order("createdAt", { ascending: false })

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(image), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


