import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("event");

  const urls = await prisma.images.findMany({
    where: {
      eventId: id ?? "",
    },
    select: {
      url: true,
    },
  });

  return new NextResponse(JSON.stringify(urls), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
