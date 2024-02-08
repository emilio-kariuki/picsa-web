import Header from "@/components/shared/header";
import { About } from "./about";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Testimonials } from "./testimonials";

export default function Home() {
  return (
    <main className="h-full bg-transparent">
      <Hero />
      <About />
      <Testimonials />
      <Footer />
    </main>
  );
}
