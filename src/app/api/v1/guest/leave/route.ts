import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/services/supabase";


export const DELETE = async (req: NextRequest, res: NextResponse) => {
    const id = req.nextUrl.searchParams.get("id");
    const { data: guest, error } = await supabase
      .from("GuestEvents")
      .delete()
      .eq("id", id);
    if (error) {
      return new NextResponse(JSON.stringify(error));
    }
    return new NextResponse(JSON.stringify(guest), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  };
  
  