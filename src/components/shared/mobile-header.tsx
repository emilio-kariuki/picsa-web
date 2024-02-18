import {
  FileTextIcon,
  HeartHandshakeIcon,
  HomeIcon,
  MenuIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserIcon,
  PhoneCall,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";

export function MobileMenu() {
  const path = usePathname();
  const { isLoaded, userId, sessionId, getToken, signOut } = useAuth();
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
  return (
    <div className="block md:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <MenuIcon className="h-6 w-6" color="#ffffff" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <HomeIcon className="mr-2 h-4 w-4" />
              <Link href={"/"}>Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <PhoneCall className="mr-2 h-4 w-4" />
              <span>Contact</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileTextIcon className="mr-2 h-4 w-4" />
              <span>About</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HeartHandshakeIcon className="mr-2 h-4 w-4" />
              <Link href={"/privacy"}>Privacy</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Link
            href={isLoaded && userId && sessionId ? "/" : "/sign-in"}
            className={
              "text-[14px] py-1 px-6 "
            }
            onClick={async () => {
              if (isLoaded && userId && sessionId) {
                signOut()
              }
            }
            }
          >
            {isLoaded && userId && sessionId ? "Sign Out" : "Sign In"}
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
