"use client";

import { cn } from "@/lib/utils";
import { User2, ShoppingCartIcon } from "lucide-react";
import { buttonVariants } from "../ui/button";
import { PLogo } from "./logo";
import Link from "next/link";
import { rubiks } from "@/lib/fonts";
import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";
import { MobileMenu } from "./mobile-header";
import { DesktopMenu } from "./desktop-header";
import { usePathname } from "next/navigation";

export default function Header() {
  const [signedIn, isSignedIn] = React.useState(false);
  const session = useSession();
  const path = usePathname();
  async function loginWithGoogle() {
    await supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: path,
        },
      })
      .then((res) => {
        console.log(res);
      });
  }

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        isSignedIn(false);
        console.log("not signed in");
      } else {
        isSignedIn(true);
        console.log("signed in");
      }
    });
  }, [isSignedIn]);
  return (
    <nav
      className={cn(
        "z-30 flex mn-w-[] px-3 w-full items-center bg-[#181a1b]",
        "sticky top-0"
      )}
    >
      <div className="mx-auto flex w-full max-w-[85rem] items-center justify-between py-3">
        <Link
          href="/"
          className=" flex flex-row gap-2 items-center justify-center"
        >
          <PLogo />
          <h2 className={`text-white text-[25px] ${rubiks.className}`}>
            Picsa
          </h2>
        </Link>

        <MobileMenu />
        <DesktopMenu />

        <div className="hidden item-center space-x-3 md:flex lg:flex">
          {!signedIn ? (
            <div className="flex flex-row gap-5 items-center">
              <div
                onClick={async () => {
                  await loginWithGoogle().then(() => {
                    isSignedIn(true);
                  });
                }}
                className={
                  "bg-[#54EA53] text-white text-[14px] py-2 px-6 font-semibold border-2 border-[#54EA53] rounded-full"
                }
              >
                Sign In
              </div>
              <Link
                href="/contact"
                className={
                  "bg-transparent text-white text-[14px] py-2 px-6 font-semibold rounded-full border-2 border-[#54EA53]"
                }
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <Link
              href="/"
              onClick={async () => {
                await supabase.auth.signOut().then(() => {
                  window.location.href = "/";
                });
              }}
              className={
                "bg-transparent text-white text-[14px] py-2 px-6 font-semibold rounded-full border-2 border-[#54EA53]"
              }
            >
              Sign Out
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";