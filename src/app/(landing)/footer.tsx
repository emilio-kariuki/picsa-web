import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import Link from "next/link";
// import { IconBrandWhatsapp } from "@tabler/icons-react";
import { MailIcon, PhoneCallIcon, PhoneCall } from "lucide-react";
import { PLogo } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";

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
    <footer className="p-5 md:py-10">
      <Container className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                      <span className="text-gray-600">{('value' in item && item.value)}</span>
                    )}
                  </div>
                );
              })}
            </nav>
          ))}
        </section>
        <section className="ml-auto py-5">
          <p className="mb-5 text-lg font-semibold">
            Subscribe to our newsletter
          </p>
          <p className="mb-5 text-gray-600">
            Get the latest news and updates from Picsa
          </p>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input type="email" placeholder="Email" />
            <Button type="submit" className="bg-[#3eb03e] hover:bg-[#54d354]">
              Subscribe
            </Button>
          </div>
        </section>
      </Container>
      <Container>
        <hr className="bg-gray-600/10" />
      </Container>
      <Container className="flex flex-col items-center justify-between pt-8 md:flex-row">
        <PLogo />
        <span className="text-center text-gray-600">
          &copy; {new Date().getFullYear()} Picsa . All rights
          reserved.
        </span>
      </Container>
    </footer>
  );
}
