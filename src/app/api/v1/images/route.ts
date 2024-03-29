import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const { data: image, error } = await supabase
    .from("Images")
    .select("*")
    .order("createdAt", { ascending: false })
    .limit(20);

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(image), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
