import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

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

export const DELETE = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data: event, error } = await supabase
    .from("Events")
    .delete()
    .eq("id", id);

  if (error) {
    return new NextResponse(
      JSON.stringify({
        deleted: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return new NextResponse(
    JSON.stringify({
      deleted: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const PUT = async (req: NextRequest, res: NextResponse) => {

};
