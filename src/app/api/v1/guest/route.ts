import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { EventModel, GuestEvents } from "@/types/apis_types";
import prisma from '@/lib/db'


export const GET = async (req: NextRequest, res: NextResponse) => {
  const users = await prisma.guestEvents.findMany({
    include:{
      Events: true,
      
    }
  })

  return new NextResponse(JSON.stringify(users), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
