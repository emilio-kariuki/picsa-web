"use client";

import { inter, interRegular, rubiks } from "@/lib/fonts";
import { MoveRight } from "lucide-react";
import Landing from "@/assets/landing.png";
import Landing2 from "@/assets/landing2.png";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative">
      <div className="w-full sm:h-fit md:h-fit py-16 px-16 sm:px-3 sm:py-3 md:px-[40px] md:py-[40px] lg:px-24 lg:py-32  flex flex-col items-center justify-center bg-[#181a1b]">
        <div className="flex flex-row item-center gap-1 lg:gap-10">
          <div className="flex flex-col items-center lg:items-start md:items-start justify-center bg-transparent text-white">
            <h1
              className={` max-w-xl text-[40px] lg:text-6xl sm:text-3xl text-center lg:text-start md:text-start font-bold text-slate ${rubiks.className}`}
            >
              Unleash the magic of Picsa
            </h1>
            <p
              className={`mt-6 max-w-[400px] mb-10 text-sm tracking-wide text-center lg:text-start md:text-start text-slate-100 ${interRegular.className}`}
            >
              Step into the vibrant world of Picsa: where moments meet magic!
              Capture, share, and relive your events with ease. Picsa, your
              passport to pixel-perfect memories. Join the fun – where every
              click tells a tale!
            </p>
            <div className="flex flex-col lg:flex-row md:flex-row gap-6  items-center">
              <Button
                onClick={() => {
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.ecoville.picsa"
                  );
                }}
                className="bg-[#54EA53] text-white px-6 py-6 lg:px-10 lg:py-6 rounded-full hover:bg-[#3bb13b]"
              >
                <div className="flex flex-row items-center gap-6 sm:gap-4 lg:gap-10 ">
                  <span className="lg:text-[16px] sm:text-[12px] md:text-[16px] font-medium text-black">
                    Download App
                  </span>
                  <MoveRight size={20} color="#000000" />
                </div>
              </Button>
              <Link
                href="/contact"
                className="text-white lg:text-[16px] sm:text-[12px] md:text-[16px] font-medium hover:text-gray-500"
              >
                Get Started
              </Link>
            </div>

            <div className="flex flex-row gap-10 items-start justify-center mt-20">
              <div className="flex flex-col  item-start">
                <span className="text-[40px] font-extrabold text-white">
                  4.8
                </span>
                <span className="text-[13px] text-white">
                  Rating on PlayStore
                </span>
              </div>
              <div className="flex flex-col  item-start">
                <span className="text-[40px] font-extrabold text-white">
                  500k+
                </span>
                <span className="text-[13px] text-white">Active Users</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex md:flex flex-row items-center justify-center">
            <div className="flex flex-col gap-20">
              <div></div>
              <div className="hidden sm:flex">
                <Image
                  src={Landing}
                  alt="Landing2"
                  className="rounded-md lg:h-[400px] lg:w-[400px] md:h-[200px] md:w-[200px] sm:h-[0px] sm:w-[0px] object-contain"
                />
              </div>
            </div>
            <div className="flex flex-col gap-20">
              <div className="hidden sm:flex">
                <Image
                  src={Landing2}
                  alt="Landing2"
                  className="rounded-md lg:h-[400px] lg:w-[400px] md:h-[200px] md:w-[200px] sm:h-[0px] sm:w-[0px] object-contain"
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>
        {/* <div className="text-green-600/10">
        <GridPattern x="80%" patternTransform="translate(0 80)" />
      </div> */}
      </div>
    </section>
  );
}

import { useId } from "react";

export function GridPattern(props: any) {
  let patternId = useId();

  return (
    <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern
          id={patternId}
          width="100"
          height="100"
          patternUnits="userSpaceOnUse"
          {...props}
        >
          <path d="M0 128V.5H128" fill="none" stroke="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
