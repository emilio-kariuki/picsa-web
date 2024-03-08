import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const { data: event, error } = await supabase
    .from("Insights")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(event), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
