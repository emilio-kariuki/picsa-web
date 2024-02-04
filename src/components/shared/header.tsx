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

export default function Header() {
  return (
    <div
      className={cn(
        "z-40 flex h-20 w-full items-center bg-white",
        "sticky top-0"
      )}
    >
      <div className="mx-auto flex w-full max-w-[85rem] items-center justify-between p-5">
        <Link
          href="/"
          className=" flex flex-row gap-2 items-center justify-center"
        >
          <PLogo />
          <h2 className={`text-black text-[30px] ${rubiks.className}`}>
            Picsa
          </h2>
        </Link>
        {/* <NavigationMenuDemo /> */}

        <div className="flex flex-row gap-5 items-center">
          <Link
            href="/contact"
            className={"bg-[#54EA53] text-black text-[14px] py-3 px-6 rounded-full"}
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Get App
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Documentation
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              About
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/docs" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Contacts
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
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
