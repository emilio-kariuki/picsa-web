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

export default function Header() {
  const session = useSession();
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
        <div className="flex flex-row gap-10">
          <Link
            href="/"
            className="text-white text-[16px] font-medium hover:text-gray-500"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-white text-[16px] font-medium hover:text-gray-500"
          >
            About
          </Link>
          <Link
            href="/about"
            className="text-white text-[16px] font-medium hover:text-gray-500"
          >
            Careers
          </Link>
          <Link
            href="/contact"
            className="text-white text-[16px] font-medium hover:text-gray-500"
          >
            Contact
          </Link>
        </div>
        <div className=" flex items-center justify-center">
       
      </div>
        {session ? (
          <div className="flex flex-row gap-5 items-center">
            <Link
              href="/contact"
              className={
                "bg-[#54EA53] text-white text-[14px] py-2 px-6 font-semibold border-2 border-[#54EA53] rounded-full"
              }
            >
              Sign In
            </Link>
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
              await supabase.auth.signOut();
            }}
            className={
              "bg-transparent text-white text-[14px] py-2 px-6 font-semibold rounded-full border-2 border-[#54EA53]"
            }
          >
            Sign Out
          </Link>
        )}
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
