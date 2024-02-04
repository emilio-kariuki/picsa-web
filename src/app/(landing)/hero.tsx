"use client";

import { inter, interRegular, rubiks } from "@/lib/fonts";
import { MoveRight } from "lucide-react";
import Landing from "@/assets/landing.png";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative m-5 bg-gradient-to-b bg-[#181a1b] rounded-[100px]">
      <div className="text-green-900/10">
        <GridPattern x="80%" patternTransform="translate(0 80)" />
      </div>
      <div className="flex flex-row gap-8 px-24 justify-center">
        <div className="flex h-[650px] flex-col items-start justify-center bg-transparent text-white">
          <h1
            className={` max-w-xl text-6xl font-bold text-slate ${rubiks.className}`}
          >
            Unleash the magic of Picsa
          </h1>
          <p
            className={`mt-6 max-w-[400px] text-sm tracking-wide text-start text-slate-100 ${interRegular.className}`}
          >
            Step into the vibrant world of Picsa: where moments meet magic!
            Capture, share, and relive your events with ease. Picsa, your
            passport to pixel-perfect memories. Join the fun – where every click
            tells a tale!
          </p>
          <div className="flex flex-row gap-10 mt-10 items-center">
            <button className="bg-[#54EA53] text-white px-8 py-4 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-slate focus:ring-opacity-50">
              <div className="flex flex-row items-center gap-10">
                <span className="text-base text-black">Get the App</span>
                <MoveRight size={24} color="#000000" />
              </div>
            </button>
            <span className="text-lg">More</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Image
            src={Landing}
            alt="Landing"
            width={350}
            height={350}
            className="rounded-md"
          />
        </div>
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
