import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const DELETE = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");
  const { data: guest, error } = await supabase
    .from("GuestEvents")
    .delete()
    .eq("id", id);
  if (error) {
    return new NextResponse(
      JSON.stringify({
        removed: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  return new NextResponse(
    JSON.stringify({
      removed: true,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
