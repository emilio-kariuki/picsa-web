import { About } from "./about";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Testimonials } from "./testimonials";

export default function Home() {
  return (
    <main className="h-full">
      <Hero />
      <About />
      <Testimonials />
      <Footer />
    </main>
  );
}
