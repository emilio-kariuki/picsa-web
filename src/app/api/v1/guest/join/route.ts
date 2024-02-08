import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type GuestData = {
  eventId: string;
  userId: string;
};

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: GuestData = await req.json();
  const exists = await supabase
    .from("GuestEvents")
    .select("*")
    .eq("eventId", data.eventId)
    .eq("userId", data.userId)
    .single();

  if (exists) {
    return new NextResponse(
      JSON.stringify({
        exists: true,
        joined: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  const { data: guest, error } = await supabase.from("GuestEvents").insert({
    id: data.userId + data.eventId,
    eventId: data.eventId,
    userId: data.userId,
  });
  if (error) {
    return new NextResponse(JSON.stringify(error));
  }
  return new NextResponse(
    JSON.stringify({
      exists: false,
      joined: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
