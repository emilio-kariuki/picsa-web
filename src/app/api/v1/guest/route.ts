import { supabase } from "@/services/supabase";
import { NextRequest, NextResponse } from "next/server";

type GuestData = {
  eventId: string;
  userId: string;
};

export const GET = async (req: NextRequest, res: NextResponse) => {
  const { data: guest, error } = await supabase.from("GuestEvents").select("*")
  if (error) {
    return new NextResponse(JSON.stringify(error));
  }
  return new NextResponse(JSON.stringify(guest), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


