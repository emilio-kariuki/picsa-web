import { NextRequest, NextResponse } from "next/server";
import {admin} from "@/lib/firebase";
import { supabase } from "@/lib/supabase";

export const POST = async(req: NextRequest) =>{
    try {
        const body = await req.json()
        const title = body.title;
        const content = body.content;
        const token = body.token;
        const userId = body.userId;
        const notification = {
          notification: {
            title: title,
            body: content,
          },
          token: token
        };
    
        try {
          const message = await admin.messaging().send(notification);
          await supabase.from("notifications").insert({
            'name': title,  
            'content': content,
            'token': token,
            'userId': userId        
      });
          console.log("notification message ",message)
        } catch (error) {
          console.error(error);
        }
        return new NextResponse(JSON.stringify({
            message: "Notification has been sent successfully"
        }), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        
      } catch (error) {
        console.log(error);
        return new NextResponse(JSON.stringify(error), {
            headers: {
              "Content-Type": "application/json",
            },
          });
      }
    
}