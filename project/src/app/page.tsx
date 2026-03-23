import HeroSection from "~/app/HeroSection";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import HowItWorksSection from "./HowItWorksSection";
import Navbar from "./Navbar";
import OperatorFeaturesSection from "./OperatorFeaturesSection";
import TestimonialsSection from "./TestimonialsSection";

export default function HomePage() {
	return (
		<main className="flex min-h-screen w-full flex-col">
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
