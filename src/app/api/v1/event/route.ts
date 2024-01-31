import { supabase } from "@/app/supabase";
import { NextResponse, NextRequest } from "next/server";
import { NextApiResponse } from "next";

export const POST = async (req: NextRequest, res: NextApiResponse) => {
  const data = await req.json();
  const { data: event, error } = await supabase
    .from("events")
    .insert([{ name: data.name, userId: data.userId }]);

  if (error) {
    return new NextResponse(JSON.stringify(error, null, 2));
  }

  return new NextResponse(JSON.stringify(event, null, 2));
};
