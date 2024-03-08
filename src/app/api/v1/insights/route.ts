import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const phone = req.nextUrl.searchParams.get("phone");
  const { data: event, error } = await supabase
    .from("Insights")
    .select("*")
    .eq("phone", phone)
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
