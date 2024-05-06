import { supabase } from "@/lib/supabase";
import { NextResponse, NextRequest } from "next/server";


export const POST = async (req: NextRequest, res: NextResponse) => {
    const data = await req.json();
    if(data.type == "INITIAL_PURCHASE"){
        const user = await supabase.from('payment').insert(
            {
                "user_id": data.app_user_id,
                'amount': data.price,
                'store': data.store,
                'environment': data.environment,
                
            }
        )
        console.log(user)
    }
    return new NextResponse(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
        },
    });
    }