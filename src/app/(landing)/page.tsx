import Header from "@/components/shared/main-header";
import { About } from "./about";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Testimonials } from "./testimonials";
import { FAQ } from "./faq";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="h-full w-full">
      <Hero />
      <About />
      <Testimonials />
      <Footer />
    </main>
  );
}
