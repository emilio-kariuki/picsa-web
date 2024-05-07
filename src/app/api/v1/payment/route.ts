import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";


export const POST = async (req: NextRequest, res: NextResponse) => {
    const data = await req.json();
    console.log(data)
    let isPro = data.event.type == "INITIAL_PURCHASE" ? true : data.event.type == "RENEWAL" ? true : data.event.type == "SUBSCRIPTION_EXTENDED" ? true : data.event.type == "TEMPORARY_ENTITLEMENT_GRANT" ? true : false;
    const user = await supabase.from('User').update({
        'pro': isPro,
        'token': data.event.subscriber_attributes.$fcmTokens.value
    }).eq('id', data.event.app_user_id)
    console.log(user)
    return new NextResponse(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
    });
}