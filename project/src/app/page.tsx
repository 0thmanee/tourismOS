import Navbar from "./Navbar";
import HeroSection from "~/app/HeroSection";
import HowItWorksSection from "./HowItWorksSection";
import OperatorFeaturesSection from "./OperatorFeaturesSection";

import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <OperatorFeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
