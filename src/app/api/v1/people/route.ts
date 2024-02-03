import { supabase } from "@/app/supabase";
import { NextRequest, NextResponse } from "next/server";

type User = {
  id: string;
  email: string;
  name: string;
  url: string;
};

export const GET = async (req: NextRequest, res: NextResponse) => {
  const id = req.nextUrl.searchParams.get("id");

  const usersJoined = [] as User[];

  const { data: people, error } = await supabase
    .from("GuestEvents")
    .select("*")
    .eq("eventId", id);

  people?.map(async (person: string) => {
    const { data: user, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", person)
      .single();
    usersJoined.push(user as User);
  });

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(usersJoined));
};
