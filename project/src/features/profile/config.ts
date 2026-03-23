/**
 * Onboarding (profile) flow: steps and options.
 */

export const ONBOARDING_STEPS = [
	{ number: 1, label: "Business" },
	{ number: 2, label: "Products" },
	{ number: 3, label: "Review" },
] as const;

export const MOROCCAN_REGIONS = [
	"Souss-Massa",
	"Marrakech-Safi",
	"Fès-Meknès",
	"Rabat-Salé-Kénitra",
	"Casablanca-Settat",
	"Oriental",
	"Tanger-Tétouan-Al Hoceïma",
	"Béni Mellal-Khénifra",
	"Drâa-Tafilalet",
	"Guelmim-Oued Noun",
	"Laâyoune-Sakia El Hamra",
	"Dakhla-Oued Ed-Dahab",
] as const;

export const PRODUCT_CATEGORIES = [
	{ label: "Argan Oil", color: "#C9913D" },
	{ label: "Saffron", color: "#c02030" },
	{ label: "Rose Water", color: "#F472B6" },
	{ label: "Honey & Bee", color: "#E8B84B" },
	{ label: "Spices", color: "#e07a20" },
	{ label: "Ceramics", color: "#60A5FA" },
	{ label: "Textiles", color: "#a78bfa" },
	{ label: "Cosmetic Oils", color: "#C9913D" },
	{ label: "Dried Herbs", color: "#4ADE80" },
	{ label: "Black Seed", color: "#4a3a2a" },
	{ label: "Preserved Foods", color: "#e07a20" },
	{ label: "Natural Soaps", color: "#86efac" },
] as const;

export const ENTITY_TYPES = [
	"Individual Producer",
	"Cooperative",
	"Company / SARL",
	"Association",
] as const;

export const EXPORT_EXPERIENCE_OPTIONS = [
	"No experience — just starting",
	"1-2 years",
	"3-5 years",
	"5+ years",
] as const;

export type OnboardingFormData = {
	firstName: string;
	lastName: string;
	phone: string;
	entityType: string;
	entityName: string;
	registrationNumber: string;
	region: string;
	city: string;
	yearEstablished: string;
	website: string;
	categories: string[];
	annualCapacity: string;
	exportExperience: string;
	agreeTerms: boolean;
	agreeMarketing: boolean;
};

export const INITIAL_ONBOARDING_FORM: OnboardingFormData = {
	firstName: "",
	lastName: "",
	phone: "",
	entityType: "",
	entityName: "",
	registrationNumber: "",
	region: "",
	city: "",
	yearEstablished: "",
	website: "",
	categories: [],
	annualCapacity: "",
	exportExperience: "",
	agreeTerms: true,
	agreeMarketing: false,
};
