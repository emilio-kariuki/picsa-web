import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "../../../../../types";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data: user, error } = await supabase
    .from("User")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(user), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: UserModel = await req.json();
  const { data: user, error } = await supabase.from("User").insert({
    id: data.id,
    name: data.name,
    email: data.email,
    url: data.url,
  });

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(user), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
