import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@/lib/provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/shared/header";

const inter = Inter({ subsets: ["latin"] });

const meta = {
  title: "Picsa",
  description: "Picsa is a camera app for taking photos and videos.",
  url: "https://www.picsa.pro",
  image: "https://www.picsa.pro/logo.png",
  type: "website",
  locale: "en_US",
  site_name: "Picsa",
  robots: "index, follow",
};

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: meta.robots,
  openGraph: {
    url: meta.url,
    title: meta.title,
    description: meta.description,
    type: "website",
    siteName: meta.title,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang="en">
        <SpeedInsights />
        <body className={inter.className}>
          <Header />
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    </Providers>
  );
}
