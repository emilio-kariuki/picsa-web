import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inter, rubiks } from "@/lib/fonts";

export function FAQ() {
  return (
    <section className="relative px-20 py-20">
      <div className="flex flex-row gap-20">
        <Questions />
      </div>
    </section>
  );
}

function Questions() {
  return (
    <div className="flex flex-col gap-5 max-w-[350px]">
      <span className={`text-black font-bold text-[40px] ${rubiks.className}`}>
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
