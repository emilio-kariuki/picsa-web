import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Link from "next/link";
// import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MailIcon, PhoneCallIcon, PhoneCall } from "lucide-react";
import { PLogo } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { rubiks } from "@/lib/fonts";

const navigation = [
  {
    title: "Company",
    items: [
      {
        label: "About us",
        href: "/about",
      },
      {
        label: "Careers",
        href: "/careers",
      },
      {
        label: "Privacy Policy",
        href: "/privacy",
      },
    ],
  },
  {
    title: "Connect",
    items: [
      {
        label: "Facebook",
        href: "https://facebook.com/picsa.com",
      },
      {
        label: "Twitter",
        href: "https://twitter.com/picsa",
      },
      {
        label: "LinkedIn",
        href: "https://linkedin.com/company/picsa",
      },
    ],
  },
  {
    title: "Reach out to us",
    items: [
      { icon: (p: any) => <PhoneCallIcon {...p} />, value: "+254 796 250 443" },
      {
        icon: (p: any) => <PhoneCall {...p} />,
        value: "+254 796 250 443",
      },
      {
        icon: (p: any) => <MailIcon {...p} />,
        value: "info@picsa.com",
      },
    ],
  },
];

export function Footer() {
  return (
    <footer className="p-5 md:py-10 ">
      <Container className="grid grid-cols-1 gap-5 md:grid-cols-2 ">
        <section className="grid grid-cols-2 items-stretch gap-8 py-5 md:grid-cols-3">
          {navigation.map((group, idx) => (
            <nav key={idx}>
              <span className="mb-8 text-lg font-semibold">{group.title}</span>
              {group.items.map((item, idx) => {
                return (
                  <div key={idx} className="my-5 flex items-center space-x-2">
                    {"icon" in item && item.icon
                      ? item.icon({ className: "w-5 h-5 flex-shrink-0" })
                      : null}
                    {"href" in item && item.href ? (
                      <Link href={item.href}>{item.label}</Link>
                    ) : (
                      <span className="text-gray-600">
                        {"value" in item && item.value}
                      </span>
                    )}
                  </div>
                );
              })}
            </nav>
          ))}
        </section>
        <Questions />
      </Container>
      <Container>
        <hr className="bg-gray-600/10" />
      </Container>
      <Container className="flex flex-col items-center justify-between m-5  md:flex-row">
        <Link
          href="/"
          className=" flex flex-row gap-2 items-center justify-center"
        >
          <PLogo />
          <h2 className={`text-black text-[25px] ${rubiks.className}`}>
            Picsa
          </h2>
        </Link>
        <span className="text-center text-gray-600">
          &copy; {new Date().getFullYear()} Picsa . All rights reserved.
        </span>
      </Container>
    </footer>
  );
}

function Questions() {
  return (
    <div className="flex flex-col gap-5 max-w-[350px] ml-auto pb-6 ">
      <span className={`text-black font-bold text-[30px] ${rubiks.className}`}>
        Got A Question for Picsa?
      </span>
      <span>
        If there are questions you want to ask, we will answer all your
        questions.
      </span>
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="email" placeholder="Email" />
        <Button type="submit" className="bg-[#000000] hover:bg-[#54d354]">
          Submit
        </Button>
      </div>
    </div>
  );
}
