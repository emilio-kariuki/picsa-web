"use client";
import { inter, interRegular, quickSand, roboto, rubiks } from "@/lib/fonts";
import { MoveUpRight } from "lucide-react";
import Wedding from "@/assets/wedding.jpg";
import Birthday from "@/assets/birthday.jpg";
import Gradutation from "@/assets/graduation.jpg";
import Conferences from "@/assets/conferences.jpg";

import Image from "next/image";

const memories = [
  {
    image: Wedding,
    title: "Weddings",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
    about:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s ",
  },
  {
    image: Birthday,
    title: "Birthdays",
    description:
      "Celebrate your special day with Picsa. Share your joy with the world.",
    about:
      "Lorem Ipsum is simply dummy text of the printing a when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
  },
  {
    image: Conferences,
    title: "Conferences",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
    about:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since thesd  dsdsdsd sdsdsd ",
  },
  {
    image: Gradutation,
    title: "Graduations",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
    about:
      "m Ipsum has been the industry's  when an unknown printer took a galley of type and scrambled it to make a type specimen book. ",
  },
];

export function About() {
  return (
    <section tabIndex={-1} className="relative">
      <div className="flex flex-col mx-auto px-8 py-8 sm:px-3 sm:py-3 lg:px-20 lg:py-20 bg-gray-100 overflow-clip ">
        <div className="mx-auto w-full justify-start items-start">
          <div className="flex w-full flex-col items-start justify-start">
            <h1
              className={`text-5xl sm:text-xl mx-auto max-w-[480px] text-center lg:text-center md:text-center  font-bold text-slate ${quickSand.className} mb-2`}
            >
              We want You to Live Lighter
            </h1>
          </div>
          <div className="h-[20px]"></div>
          <ImagesSection />
        </div>
        <div className="mt-5 flex items-center justify-center">
          <button
            onClick={() => {
              window.open(
                "https://play.google.com/store/apps/details?id=com.ecoville.picsa"
              );
            }}
            className="bg-[#54EA53] text-white px-8 py-4 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-slate focus:ring-opacity-50"
          >
            <div className="flex flex-row items-center gap-10">
              <span className="text-base text-black">
                Download the app from PlayStore
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

function ImagesSection() {
  return (
    <div className="grid grid-cols-1 gap:6 lg:gap-8 md:gap-8 sm:grid-cols-1 lg:grid-cols-4 md:grid-cols-2 ">
      {memories.map((memory, index) => (
        <div
          key={index}
          className="flex flex-col items-start py-2 sm:py-5 justify-start bg-transparent rounded-md "
        >
          <p
            key={index}
            className={` my-6 max-w-lg h-18  text-[14px] tracking-tight text-start text-gray-500 ${interRegular.className}`}
          >
            {memory.about}
          </p>
          <Image
            src={memory.image}
            alt={memory.title}
            width={300}
            height={100}
            className="masked-image h-[200px] w-[400px] rounded-[8px] sm:h-[100px] sm:w-[200px] md:h-[250px] md:w-[800px] lg:h-[370px] lg:w-[800px] object-cover"
          />
          <div className="flex flex-col items-start justify-start pt-2 bg-transparent">
            <h2 className={`text-2xl text-slate ${inter.className}`}>
              {memory.title}
            </h2>
            <p
              className={`mt-2 max-w-lg text-[12px] tracking-tight text-start text-black-200 ${interRegular.className}`}
            >
              {memory.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
