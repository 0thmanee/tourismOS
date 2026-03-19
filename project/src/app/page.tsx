import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <main className="flex flex-col w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <TestimonialsSection />
      <FAQSection />
      <Footer />
    </main>
  );
}
