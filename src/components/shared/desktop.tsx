"use client";

import { cn } from "@/lib/utils";
import {
  Building2Icon,
  HeartHandshakeIcon,
  LucideProps,
  TractorIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabase";

type PageLink = {
  label: string;
  href: string;
};

export function DesktopMenu() {
  const activePath = usePathname();
  const session = useSession();

  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Contact",
      href: "/contact",
    },
    {
      label: "About",
      href: "/about",
    },
    {
        label: "Privacy",
        href: "/privacy",
      },
  ];

  return (
    <NavigationMenu className="hidden md:flex">
      <NavigationMenuList className="flex items-center space-x-5">
        {links.map((link) => (
          <NavigationMenuItem key={link.label}>
            <Link href={link.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  "rounded-3xl px-3 py-2 text-base font-normal transition-colors",
                  activePath === link.href
                    ? "bg-green-100 text-green-800 hover:bg-green-200/50"
                    : "text-white hover:bg-gray-200/40 "
                )}
              >
                {link.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
