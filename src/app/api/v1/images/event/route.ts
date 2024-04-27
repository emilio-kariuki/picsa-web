import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("event");

  const images = await prisma.images.findMany({
    where:{
      eventId: id
    },
    include:{
      User: true
    }
  })

  
  return new NextResponse(JSON.stringify(images), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};


