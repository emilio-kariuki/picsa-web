import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("user");

  const urls = await prisma.images.findMany({
    where: {
      userId: id ?? '',
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
