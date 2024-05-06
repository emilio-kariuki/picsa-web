import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";


export const POST = async (req: NextRequest, res: NextResponse) => {
    const data = await req.json();
    const user = await supabase.from('payment').insert(
        {
            "user_id": data.event.app_user_id,
            'amount': data.event.price,
            'store': data.event.store,
            'environment': data.event.environment,
            'type': data.event.type,
            
        }
    )
    return new NextResponse(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
    });
    }