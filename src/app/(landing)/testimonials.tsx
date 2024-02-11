import { interRegular, quickSand, quickSandRegular } from "@/lib/fonts";
import Birthday from "@/assets/birthday.jpg";
import Image from "next/image";
import { GridPattern } from "./hero";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";

const testimonials = [
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#BBF89F",
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#CCBAFE",
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#A6E3F9",
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#CCBAFE",
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#A6E3F9",
  },
];

export function Testimonials() {
  return (
    <section className="relative px-10 py-20 bg-black-100 ">
      <div className="flex  w-full flex-col justify-center items-center ">
        <h1
          className={`max-w-[600px] text-4xl font-bold text-slate text-center ${quickSand.className} mb-10`}
        >
          What Other People Have to Say About Picsa Pro
        </h1>
        <CarouselSize />
      </div>
      <Container>
        <hr className="bg-gray-600/10 mt-16" />
      </Container>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div
      className={`flex flex-col max-w-[350px] py-8 justify-start items-start bg-transparent rounded-[10px] p-[20px]`}
    >
      <Quote size={30} color="#000000" className="mb-5" />
      <p className={`text-black text-[18px] ${quickSandRegular.className}`}>
        {testimonial.testimonial}
      </p>

      <p className={`text-black text-[17px] ${quickSandRegular.className}`}>
        {testimonial.testimonial}
      </p>
      <div className="h-[40px]"></div>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Image
          src={Birthday}
          alt={`${testimonial.name}'s profile`}
          className="h-8 w-8 rounded-full"
        />
        <div className="flex flex-col items-start justify-center">
          <p className="text-sky-800 dark:text-sky-400 font-semibold text-[14px]">
            {testimonial.name}
          </p>
          <p className="text-black font-medium text-xs">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function CarouselSize() {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full flex flex-col max-w-screen-lg "
    >
      <CarouselContent>
        {testimonials.map((testimonial, index) => (
          <CarouselItem key={index} className="lg:basis-1/3 md:basis-1/2 sm:basis-1/1">
            <div className="p-1">
              <Card className="bg-transparent">
                <TestimonialCard testimonial={testimonial} />
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselNext /> */}
    </Carousel>
  );
}
