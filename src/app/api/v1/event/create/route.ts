import { supabase } from "@/lib/supabase";
import { EventData } from "@/types/apis_types";
import { NextRequest, NextResponse } from "next/server";



export const POST = async (req: NextRequest, res: NextResponse) => {
  const data: EventData = await req.json();
  const { data: event, error } = await supabase
    .from("Events")
    .insert({
      id: data.id,
      name: data.name,
      userId: data.userId,
      url: data.url,
    })
    .single();

  if (error) {
    return new NextResponse(JSON.stringify({
      created: false,
    }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      });
  }


  return new NextResponse(JSON.stringify({
    created: true,
  }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
