import { supabase } from "@/services/supabase";
import { NextRequest, NextResponse } from "next/server";

type GuestData = {
  eventId: string;
  userId: string;
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: GuestData = await req.json();
  const { data: guest, error } = await supabase.from("GuestEvents").insert({
    id: data.userId + data.eventId,
    eventId: data.eventId,
    userId: data.userId,
  });
  if (error) {
    return new NextResponse(JSON.stringify(error));
  }
  return new NextResponse(JSON.stringify(guest), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

