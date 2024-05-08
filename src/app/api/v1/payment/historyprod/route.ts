import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data = await req.json();
  console.log(data);
    
  const payment = await supabase.from("payment").insert({
        "app": data.event.app_id,
        'user_id': data.event.app_user_id,
        'type': data.event.type,
        "amount":  `${data.event.price_in_purchased_currency}`,
        "currency": data.event.currency,
        'store': data.event.store,
        'environment': data.event.environment,
        "expiration": `${data.event.expiration_at_ms}`,
        "transaction_id":data.event.transaction_id,
        'subscriber':{
            'name': data.event.subscriber_attributes.$displayName.value,
            'email': data.event.subscriber_attributes.$email.value,
            'token': data.event.subscriber_attributes.$fcmTokens.value
        },
        'product':{
            'offering_id': data.event.presented_offering_id,
            'product_id': data.event.product_id,
            'purchased_at': data.event.purchased_at_ms,
            'store': data.event.store,
            'price': data.event.price_in_purchased_currency,
            'currency': data.event.currency,
            'entitlement_id': data.event.entitlement_ids[0],
        }
    
  });

  console.log("payment records have been updated successfully", payment);
  return new NextResponse(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

