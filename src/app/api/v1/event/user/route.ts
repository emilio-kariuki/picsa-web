import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const user = req.nextUrl.searchParams.get("user");
  const { data: events, error } = await supabase
    .from("Events")
    .select("*")
    .eq("userId", user);
  if (error) {
    return new NextResponse(JSON.stringify(error), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  return new NextResponse(JSON.stringify(events), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
