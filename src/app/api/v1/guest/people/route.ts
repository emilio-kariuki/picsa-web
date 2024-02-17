import { supabase } from "@/lib/supabase";
import { GuestEvents, User } from "@/types/apis_types";
import { NextRequest, NextResponse } from "next/server";



export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    const event = req.nextUrl.searchParams.get("event");

    const { data: people, error: peopleError } = await supabase
      .from("GuestEvents")
      .select("*")
      .eq("eventId", event);

    if (peopleError) {
      throw new Error(JSON.stringify(peopleError));
    }

    const usersJoined: User[] = [];

    await Promise.all(
      people?.map(async (person: GuestEvents) => {
        const { data: user, error: userError } = await supabase
          .from("User")
          .select("*")
          .eq("id", person.userId)
          .single();

        if (userError) {
          throw new Error(JSON.stringify(userError));
        }

        if (user) {
          usersJoined.push(user);
        }
      })
    );

    return new NextResponse(JSON.stringify(usersJoined), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
