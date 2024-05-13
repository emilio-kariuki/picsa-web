import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data = await req.json();
  console.log(data);
  let isPro = data.event.type == "INITIAL_PURCHASE"
    ? true
    : data.event.type == "RENEWAL"
    ? true
    : data.event.type == "SUBSCRIPTION_EXTENDED"
    ? true
    : data.event.type == "TEMPORARY_ENTITLEMENT_GRANT"
    ? true
    : data.event.type == "CANCELLATION"
    ? false
    : data.event.type == "UNCANCELLATION"
    ? true
    : data.event.type == "EXPIRATION"
    ? false
    : data.event.type == "BILLING_ISSUE"
    ? false
    : data.event.type == "SUBSCRIPTION_EXTENDED"
    ? true
    : false;
    await supabase.from("User").update({
    "pro": isPro,
    "token": data.event.subscriber_attributes.$fcmTokens.value,
    "payment": {
      "pro": isPro,
      "title": isPro ? "Premium Plan" : "Free Plan",
      "environment": data.event.environment,
      "price": `${data.event.price_in_purchased_currency}`,
      "expiration": isPro ? `${data.event.expiration_at_ms}` : "never",
      "currency": data.event.currency,
      "transactionId": isPro ? data.event.transaction_id : "none",
    },
  }).eq("id", data.event.app_user_id);
  console.log("user payment profile has been updated successfully");
  return new NextResponse(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
