import { interRegular, quickSand, quickSandRegular } from "@/lib/fonts";
import Birthday from "@/assets/birthday.jpg";
import Image from "next/image";
import { GridPattern } from "./hero";

const testimonials = [
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#BBF89F"
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#CCBAFE"
  },
  {
    testimonial:
      "The app is amazing. I love the way it captures moments. It's so easy to use and the quality is amazing.",
    name: "Emilio Kariuki",
    role: "CEO, Picsa",
    color: "#A6E3F9"
  },
];



 export function Testimonials() {
  return (
    <section className="relative px-10 py-20 bg-black-100">
      <div className="flex h-[325px] w-full flex-col justify-start items-center ">
        <div className="flex flex-row items-center justify-start gap-14 mb-[40px]">
          <h1
            className={`max-w-[400px] text-4xl font-bold text-slate ${quickSand.className}`}
          >
            Testimonials
          </h1>
          <p
            className={`mt-6 max-w-[400px] text-[15px] tracking-tight text-start text-black-200 ${interRegular.className}`}
          >
            You tell your story. We want to help you make memories that last a lifetime.
          </p>
          <p
            className={`mt-6 max-w-[400px] text-[15px] tracking-tight text-start text-black-200 ${interRegular.className}`}
          >
            We believe that every moment is special and unique. We want to help you capture and share those moments with the world.
          </p>
        </div>
        <TestimonialSection />
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <div className="flex flex-row gap-8 justify-start items-start ">
      {testimonials.map((testimonial, index) => (
        <TestimonialCard key={index} testimonial={testimonial} />
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: any }) {

  return (
    <div className={`flex flex-col max-w-[350px] py-8 justify-start items-start bg-[#CCBAFE] rounded-[30px] p-[20px]`}>
      <p className={`text-black text-[18px] ${quickSandRegular.className}`}>{testimonial.testimonial}</p>
      <div className="h-[40px]"></div>
      <div className="flex flex-row gap-2 items-center justify-center">
        <Image 
          src={Birthday}
          alt={`${testimonial.name}'s profile`}
          className="h-8 w-8 rounded-full"
        />
        <div className="flex flex-col items-start justify-center">
          <p className="text-black text-xs">{testimonial.name}</p>
          <p className="text-black text-xs">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

