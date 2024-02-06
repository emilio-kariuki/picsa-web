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
    title: "Wedding",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
  },
  {
    image: Birthday,
    title: "Birthdays",
    description:
      "Celebrate your special day with Picsa. Share your joy with the world.",
  },
  {
    image: Conferences,
    title: "Conferences",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
  },
  {
    image: Gradutation,
    title: "Graduation",
    description:
      "Capture the magic of your special day with Picsa. Share your love with the world.",
  },
];

export function About() {
  return (
    <section className="relative flex flex-col mt-[80px] px-20 py-20 bg-gray-100 ">
      <div className="flex h-[800px] w-full flex-col justify-start items-start ">
        <div className="flex flex-col items-start justify-start">
          <h1
            className={`  text-5xl font-bold text-slate ${quickSand.className}`}
          >
            Different Memories
          </h1>
          <div className="flex flex-row gap-8 justify-center">
            <p
              className={`mt-6 max-w-[350px] text-sm tracking-tight text-start text-black-200 ${interRegular.className}`}
            >
              You tell your story. We want to help you make memories that last a
              lifetime. We want to help you make memories that last a lifetime.
            </p>
            <p
              className={`mt-6 max-w-[350px] text-sm tracking-tight text-start text-black-200 ${interRegular.className}`}
            >
              We believe that every moment is special and unique. We want to
              help you capture and share those moments with the world.
            </p>
            <p
              className={`mt-6 max-w-[350px] text-sm tracking-tight text-start text-black-200 ${interRegular.className}`}
            >
              We believe that every moment is special and unique. We want to
              help you capture and share those moments with the world.
            </p>
           
          </div>
        </div>
        <div className="h-[60px]"></div>
        <ImagesSection />
        
      </div>
      <div className=" flex items-center justify-center">
        <button onClick={()=>{
           window.open(
            "https://play.google.com/store/apps/details?id=com.ecoville.picsa"
          );
        }} className="bg-[#54EA53] text-white px-8 py-4 rounded-full hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-slate focus:ring-opacity-50">
          <div className="flex flex-row items-center gap-10">
            
            <span className="text-base text-black">
              Download the app from PlayStore
            </span>
          </div>
        </button>
      </div>
      
    </section>
  );
}

function ImagesSection() {
  return (
    <div className="flex flex-row gap-5 ">
      {memories.map((memory, index) => (
        <div
          key={index}
          className="flex flex-col items-start justify-start w-[300px] h-[300px] bg-transparent rounded-md"
        >
          <Image
            src={memory.image}
            alt={memory.title}
            className=" h-[400px] rounded-[10px]"
          />
          <div className="flex flex-col items-start justify-start pt-4 bg-transparent">
            <h2 className={`text-2xl text-slate ${inter.className}`}>
              {memory.title}
            </h2>
            <p
              className={`mt-2 text-sm tracking-tight text-start text-black-200 ${interRegular.className}`}
            >
              {memory.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
