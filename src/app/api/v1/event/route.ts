import { supabase } from "@/services/supabase";
import { NextApiRequest } from "next";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data: event, error } = await supabase
    .from("Events")
    .select("*")
    .eq("id", id)
    .order("createdAt", { ascending: false })
    .single();

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(event), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const { data: event, error } = await supabase
    .from("Events")
    .insert(req.body)
    .single();

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(event), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
