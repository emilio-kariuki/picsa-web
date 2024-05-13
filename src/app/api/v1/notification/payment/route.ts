import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export const POST = async (req: NextRequest, res: NextResponse) => {
  const data = await req.json();
  const title = data.event.type == "INITIAL_PURCHASE"
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
  : " ";
  const content = data.event.type == "INITIAL_PURCHASE"
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
  : " ";
  const token = data.event.subscriber_attributes.$fcmTokens.value;
  const userId = data.event.app_user_id;
  await axios.post(
    "https://picsa.pro/api/v1/notification",
    {
      "title": title,
      "content": content,
      "token": token
    },
  )
  await supabase.from("notifications").insert({
    'name': title,  
    'content': content,
    'token': token,
    'userId': userId        
});
  console.log("Notification sent successfully");
  return new NextResponse(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};
