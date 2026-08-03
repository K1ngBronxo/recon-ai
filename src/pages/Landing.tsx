import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Security } from "../components/landing/Security";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-950 text-zinc-200">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Security />
      <CTA />
      <Footer />
    </div>
  );
}
