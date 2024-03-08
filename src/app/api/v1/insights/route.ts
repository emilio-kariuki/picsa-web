import { NextResponse, NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export const GET = async (req: NextRequest, res: NextResponse) => {
  const phone = req.nextUrl.searchParams.get("phone");
  const { data: event, error } = await supabase
    .from("Insights")
    .select("*")
    .eq("phone", phone)

  if (error) {
    return new NextResponse(JSON.stringify(error));
  }

  return new NextResponse(JSON.stringify(event), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
// import { authMiddleware } from "@clerk/nextjs";

// export default authMiddleware({
//   publicRoutes: [
//     '/',
//     '/privacy',
//     '/api/v1/event',
//     '/api/v1/guest',
//     '/api/v1/guest/join',
//     '/api/v1/guest/leave',
//     '/api/v1/guest/people',
//     '/api/v1/images',
//     '/api/v1/insights',
//     '/api/v1/images/event',
//     '/api/v1/images/url',
//     '/api/v1/images/user',
//     '/api/v1/upload',
//     '/api/v1/user',
//     '/sign-in',
//     '/sign-up'

//   ],
//   signInUrl: '/sign-in',
// })

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };
