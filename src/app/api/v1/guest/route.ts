import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { EventModel, GuestEvents } from "@/types/apis_types";


export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data, error } = await supabase
    .from("GuestEvents")
    .select("*")
    .eq("userId", id);

  if (error) {
    throw error;
  }
  const events: EventModel[] = [];

  for (const event of data as GuestEvents[]) {
    const { data: eventData, error: eventError } = await supabase
      .from("Events")
      .select("*")
      .eq("id", event.eventId);
    if (eventError) {
      throw eventError;
    }
    events.push(eventData[0] as EventModel);
  }
  if (error) {
    return new NextResponse(JSON.stringify(error));
  } ``
  return new NextResponse(JSON.stringify(events), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
