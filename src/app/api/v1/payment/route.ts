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
  const user = await supabase.from("User").update({
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

  const response = await axios.post(
    "https://picsa.pro/api/v1/notification",
    {
      "title": data.event.type == "INITIAL_PURCHASE"
        ? "Subscribed to Plan"
        : data.event.type == "RENEWAL"
        ? "Subscription Renewed"
        : data.event.type == "SUBSCRIPTION_EXTENDED"
        ? "Subscription Extended"
        : data.event.type == "CANCELLATION"
        ? "Subscription Cancelled"
        : data.event.type == "UNCANCELLATION"
        ? "Subscription uncancelled"
        : data.event.type == "EXPIRATION"
        ? "Subscription expired"
        : data.event.type == "BILLING_ISSUE"
        ? "Billing issues"
        : data.event.type == "SUBSCRIPTION_EXTENDED"
        ? "Subscription extended"
        : " ",
      "content": data.event.type == "INITIAL_PURCHASE"
        ? "You have subscribed to the plan"
        : data.event.type == "RENEWAL"
        ? "Your subscription has been renewed"
        : data.event.type == "SUBSCRIPTION_EXTENDED"
        ? "Your subscription has been extended"
        : data.event.type == "CANCELLATION"
        ? "Your subscription has been cancelled"
        : data.event.type == "UNCANCELLATION"
        ? "Cancellatation removed"
        : data.event.type == "EXPIRATION"
        ? "Your subscription has expired"
        : data.event.type == "BILLING_ISSUE"
        ? "You have billng issues"
        : data.event.type == "SUBSCRIPTION_EXTENDED"
        ? "Your subscription has been extended"
        : " ",
      "token": data.event.subscriber_attributes.$fcmTokens.value,
    },
  )
  console.log("user payment profile has been updated successfully");
  return new NextResponse(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
