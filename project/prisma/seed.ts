/**
 * TourismOS — Prisma seed aligned with `schema.prisma` (2025).
 *
 * - Superadmin + partner users (credential auth)
 * - Organizations with **logo + metadata** for B2C `ExperienceDTO` (city, gallery, trust, meeting, languages)
 * - `OrganizationSettings` + `Activity` catalog per org (marketplace variety)
 * - Demo org (`coop-agrumes-souss`): full inbox reset — staff, customers, bookings, messages, assignments
 * - Other orgs: keep existing smoke bookings; catalog activities are replaced each run
 *
 * Run: pnpm db:seed  (requires DATABASE_URL)
 * Default password: Password123!
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
	type ActivityKind,
	type PricingKind,
	type Prisma,
	PrismaClient,
} from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: ["error"],
});

const SEED_PASSWORD = "Password123!";
const DEMO_ORG_SLUG = "coop-agrumes-souss";

type BookingStatus = "NEW" | "PENDING" | "CONFIRMED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "DEPOSIT" | "PAID";

type ActivitySpec = {
	name: string;
	kind: ActivityKind;
	pricingKind: PricingKind;
	capacity?: number;
	resourceCapacity?: number;
	fixedSlots?: Prisma.InputJsonValue;
	durationOptions?: Prisma.InputJsonValue;
	defaultDurationDays?: number;
	defaultPriceMad: number;
	sortOrder: number;
	requiresGuide?: boolean;
	requiresTransport?: boolean;
	requiresEquipment?: boolean;
};

type PartnerOrgSeed = {
	orgName: string;
	slug: string;
	userEmail: string;
	userName: string;
	entityType: string;
	region: string;
	city: string;
	categories: string[];
	logo: string;
	metadata: Prisma.InputJsonValue;
	businessName: string;
	settingsActivities: string[];
	pricingPresets: Prisma.InputJsonValue;
	activities: ActivitySpec[];
};

const PARTNER_ORGS: PartnerOrgSeed[] = [
	{
		orgName: "Coopérative Agrumes Souss",
		slug: DEMO_ORG_SLUG,
		userEmail: "contact@coop-agrumes.ma",
		userName: "Rachid El Amrani",
		entityType: "Cooperative",
		region: "Souss-Massa",
		city: "Agadir",
		categories: ["Tours", "Desert", "Coastal"],
		logo: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
		metadata: {
			marketCity: "Agadir",
			verified: true,
			operatorBio:
				"Souss-based cooperative running desert, coastal, and cultural experiences with vetted guides.",
			gallery: [
				"https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80",
				"https://images.unsplash.com/photo-1542401886-65d6c61db217?w=1200&q=80",
				"https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80",
			],
			highlights: [
				"Licensed local guides",
				"Clear pickup windows",
				"Small-group friendly",
			],
			includes: [
				"Bottled water on full-day tours",
				"Insurance basics where required",
			],
			meetingPoint: "Hotel pickup in Agadir or agreed meeting point",
			meetingNote: "Exact GPS pin is shared after confirmation.",
			languages: ["EN", "FR", "AR"],
		},
		businessName: "Souss Experience Tours",
		settingsActivities: [
			"Desert overnight",
			"Quad & lunch",
			"Cooking workshop",
			"Day trip Atlas",
			"Coastal surf day",
		],
		pricingPresets: [
			{ label: "Half day", priceMad: 450 },
			{ label: "Full day", priceMad: 850 },
			{ label: "Private group (4pax)", priceMad: 2200 },
			{ label: "Deposit default", priceMad: 200 },
		],
		activities: [
			{
				name: "Desert sunrise — fixed departures",
				kind: "FIXED_SLOT",
				pricingKind: "PER_PERSON",
				capacity: 14,
				fixedSlots: ["06:00", "08:00", "10:00"],
				defaultPriceMad: 850,
				sortOrder: 1,
				requiresTransport: true,
			},
			{
				name: "Quad & palmeraie — on request",
				kind: "FLEXIBLE",
				pricingKind: "PER_PERSON",
				capacity: 8,
				defaultPriceMad: 650,
				sortOrder: 2,
				requiresEquipment: true,
			},
			{
				name: "Atlas & Berber villages trek",
				kind: "MULTI_DAY",
				pricingKind: "PER_PERSON",
				capacity: 10,
				durationOptions: [2, 3, 5],
				defaultDurationDays: 3,
				defaultPriceMad: 2400,
				sortOrder: 3,
				requiresGuide: true,
			},
			{
				name: "Surf gear — half-day rental",
				kind: "RESOURCE_BASED",
				pricingKind: "PER_GROUP",
				resourceCapacity: 6,
				defaultPriceMad: 400,
				sortOrder: 4,
				requiresEquipment: true,
			},
		],
	},
	{
		orgName: "Biodattes Tafilalet",
		slug: "biodattes-tafilalet",
		userEmail: "info@biodattes.ma",
		userName: "Fatima Bennani",
		entityType: "Company / SARL",
		region: "Drâa-Tafilalet",
		city: "Erfoud",
		categories: ["Desert", "Culture"],
		logo: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=800&q=80",
		metadata: {
			marketCity: "Merzouga",
			verified: true,
			operatorBio:
				"Desert hospitality team focused on dunes, camel treks, and camp evenings with clear safety briefings.",
			gallery: [
				"https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1200&q=80",
				"https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&q=80",
			],
			highlights: ["Golden-hour departures", "Berber camp partners"],
			includes: ["Traditional tea", "Blankets in season"],
			meetingPoint: "Merzouga village meeting point or riad pickup",
			meetingNote: "4x4 transfer details are confirmed 24h before.",
			languages: ["EN", "FR"],
		},
		businessName: "Biodattes Desert Journeys",
		settingsActivities: ["Camel trek", "Lux camp", "Stargazing"],
		pricingPresets: [{ label: "Sunset ride", priceMad: 320 }],
		activities: [
			{
				name: "Camel trek — sunset departures",
				kind: "FIXED_SLOT",
				pricingKind: "PER_PERSON",
				capacity: 12,
				fixedSlots: ["17:00", "17:30", "18:00"],
				defaultPriceMad: 320,
				sortOrder: 1,
			},
			{
				name: "Private dunes day — flexible",
				kind: "FLEXIBLE",
				pricingKind: "PER_GROUP",
				capacity: 6,
				defaultPriceMad: 1800,
				sortOrder: 2,
				requiresTransport: true,
			},
		],
	},
	{
		orgName: "Huile d'Argane Aït Baâmrane",
		slug: "huile-argane-ait-baamrane",
		userEmail: "hello@argane-ab.ma",
		userName: "Mohammed Idrissi",
		entityType: "Cooperative",
		region: "Souss-Massa",
		city: "Essaouira",
		categories: ["Culture", "Food"],
		logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
		metadata: {
			marketCity: "Essaouira",
			verifiedOperator: true,
			operatorBio:
				"Coastal cooperative combining argan cooperatives visits with light outdoor activities.",
			gallery: [
				"https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
				"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
			],
			highlights: ["Women's cooperative visit", "Tasting flight"],
			includes: ["Samples to take away"],
			meetingPoint: "Essaouira medina gate or hotel",
			languages: ["EN", "AR"],
		},
		businessName: "Argane & Atlantic Walks",
		settingsActivities: ["Co-op visit", "Coastal walk"],
		pricingPresets: [{ label: "Half day culture", priceMad: 460 }],
		activities: [
			{
				name: "Argan cooperative & coastal walk — multi-day option",
				kind: "MULTI_DAY",
				pricingKind: "PER_PERSON",
				capacity: 8,
				durationOptions: [1, 2],
				defaultDurationDays: 1,
				defaultPriceMad: 520,
				sortOrder: 1,
			},
			{
				name: "Board rental — resource slot",
				kind: "RESOURCE_BASED",
				pricingKind: "PER_PERSON",
				resourceCapacity: 10,
				defaultPriceMad: 150,
				sortOrder: 2,
				requiresEquipment: true,
			},
		],
	},
	{
		orgName: "Miel & Thym Atlas",
		slug: "miel-thym-atlas",
		userEmail: "contact@miel-atlas.ma",
		userName: "Khadija Tazi",
		entityType: "Association",
		region: "Marrakech-Safi",
		city: "Marrakech",
		categories: ["Nature", "Food"],
		logo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
		metadata: {
			marketCity: "Marrakech",
			verified: true,
			operatorBio:
				"Atlas-focused hosts for day hikes, beekeeping visits, and family-friendly pacing.",
			gallery: [
				"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
				"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
			],
			highlights: ["Village tea stop", "Moderate trails"],
			includes: ["Lunch on full-day hikes"],
			meetingPoint: "Marrakech — Gueliz or Medina pickup",
			meetingNote: "Pickup window sent the evening before.",
			languages: ["EN", "FR", "AR"],
		},
		businessName: "Atlas & Hive Experiences",
		settingsActivities: ["Day hike", "Beekeeping visit"],
		pricingPresets: [{ label: "Day hike", priceMad: 850 }],
		activities: [
			{
				name: "Ourika valley day hike",
				kind: "FIXED_SLOT",
				pricingKind: "PER_PERSON",
				capacity: 10,
				fixedSlots: ["08:00", "09:00"],
				defaultPriceMad: 850,
				sortOrder: 1,
				requiresGuide: true,
			},
			{
				name: "Beekeeping & thyme hills — request",
				kind: "FLEXIBLE",
				pricingKind: "PER_PERSON",
				capacity: 6,
				defaultPriceMad: 620,
				sortOrder: 2,
			},
		],
	},
];

function randomPick<T>(arr: T[]): T {
	const i = Math.floor(Math.random() * arr.length);
	const v = arr[i];
	if (v === undefined) throw new Error("randomPick: empty array");
	return v;
}

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(d: Date, n: number): Date {
	const x = new Date(d);
	x.setDate(x.getDate() + n);
	return x;
}

function atHour(d: Date, h: number, m = 0): Date {
	const x = new Date(d);
	x.setHours(h, m, 0, 0);
	return x;
}

const ACTIVITIES_FALLBACK_TITLES = [
	"Desert Tour — Erg Chebbi",
	"Quad Bike — Palmeraie",
	"Cooking Class — Tagine",
	"Atlas Day Hike",
	"Surf Lesson — Taghazout",
	"City Tour — Marrakech Medina",
	"Hot Air Balloon — Marrakech",
	"Camel Trek — Sunset",
	"Photography Workshop",
	"Wine & Cheese Tasting",
	"Berber Village Visit",
	"Spa & Hammam Half Day",
];

const FIRST_NAMES = [
	"Ahmed",
	"Youssef",
	"Omar",
	"Hassan",
	"Fatima",
	"Aicha",
	"Khadija",
	"Samira",
	"John",
	"Lisa",
	"Emma",
	"Thomas",
	"Sophie",
	"Pierre",
	"Maria",
];

const LAST_NAMES = [
	"Alami",
	"Benali",
	"Idrissi",
	"Tazi",
	"Bennani",
	"Smith",
	"Martin",
	"Bernard",
	"Müller",
	"Rossi",
];

const CUSTOMER_NOTES = [
	null,
	null,
	null,
	"VIP — prefers morning slots",
	"Allergic to nuts",
	"Repeat client from 2024",
	"Asked for French-speaking guide",
	"Corporate group — invoice needed",
	"Honeymoon — surprise cake",
];

const OPERATOR_SNIPPETS = [
	"Confirmed. Pick-up at hotel lobby 08:30.",
	"Deposit received — thank you!",
	"Sent WhatsApp with meeting point pin.",
	"Pending availability — will confirm by EOD.",
	"Please confirm headcount by Thursday.",
	"Weather backup plan discussed.",
];

const CUSTOMER_MSGS = [
	"Hi, can we move 30min later?",
	"What should we wear for the desert?",
	"We land late — is evening pickup ok?",
	"Thanks! See you tomorrow.",
];

function multiDayEndAt(startAt: Date, durationDays: number): Date {
	const end = new Date(startAt);
	end.setHours(0, 0, 0, 0);
	end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
	end.setHours(23, 59, 59, 999);
	return end;
}

async function main() {
  const hashedPassword = await hashPassword(SEED_PASSWORD);

  const admin = await prisma.user.upsert({
		where: { email: "admin@tourismos.ma" },
    update: {},
    create: {
			name: "Admin TourismOS",
			email: "admin@tourismos.ma",
      emailVerified: true,
      role: "superadmin",
      status: "enabled",
      profileCompleted: true,
    },
  });

  const adminAccount = await prisma.account.findFirst({
		where: {
			userId: admin.id,
			providerId: "credential",
			accountId: admin.email,
		},
  });
  if (adminAccount) {
		await prisma.account.update({
			where: { id: adminAccount.id },
			data: { password: hashedPassword },
		});
  } else {
    await prisma.account.create({
      data: {
        userId: admin.id,
        providerId: "credential",
        accountId: admin.email,
        password: hashedPassword,
      },
    });
  }

  console.log("Admin:", admin.email);

	const orgIdBySlug = new Map<string, string>();

	for (const p of PARTNER_ORGS) {
    const org = await prisma.organization.upsert({
      where: { slug: p.slug },
			update: {
				name: p.orgName,
				logo: p.logo,
				metadata: p.metadata as Prisma.JsonObject,
			},
			create: {
				name: p.orgName,
				slug: p.slug,
				logo: p.logo,
				metadata: p.metadata as Prisma.JsonObject,
			},
		});
		orgIdBySlug.set(p.slug, org.id);

    const user = await prisma.user.upsert({
      where: { email: p.userEmail },
      update: {},
      create: {
        name: p.userName,
        email: p.userEmail,
        emailVerified: true,
        role: "partner",
        status: "enabled",
        profileCompleted: true,
      },
    });

		const cred = await prisma.account.findFirst({
			where: {
				userId: user.id,
				providerId: "credential",
				accountId: user.email,
			},
		});
		if (cred) {
			await prisma.account.update({
				where: { id: cred.id },
				data: { password: hashedPassword },
			});
    } else {
      await prisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.email,
          password: hashedPassword,
        },
      });
    }

    await prisma.member.upsert({
      where: {
        organizationId_userId: { organizationId: org.id, userId: user.id },
      },
      update: {},
      create: {
        organizationId: org.id,
        userId: user.id,
        role: "owner",
      },
    });

		const [firstName, ...rest] = p.userName.split(" ");
    await prisma.profile.upsert({
      where: { userId: user.id },
			update: {
				firstName: firstName ?? p.userName,
				lastName: rest.join(" ") || "—",
				phone: "+212 6XX XXX XXX",
				entityType: p.entityType,
				entityName: p.orgName,
				region: p.region,
				city: p.city,
				categories: p.categories,
				agreeTerms: true,
				agreeMarketing: false,
			},
      create: {
        userId: user.id,
				firstName: firstName ?? p.userName,
				lastName: rest.join(" ") || "—",
        phone: "+212 6XX XXX XXX",
				entityType: p.entityType,
        entityName: p.orgName,
				region: p.region,
				city: p.city,
				categories: p.categories,
        agreeTerms: true,
        agreeMarketing: false,
      },
    });
  }

	console.log(
		"Partners:",
		PARTNER_ORGS.length,
		"orgs (logo, metadata, settings, members)",
	);

	const demoOrgId = orgIdBySlug.get(DEMO_ORG_SLUG);
	if (!demoOrgId) throw new Error(`Missing demo org ${DEMO_ORG_SLUG}`);

	const allOrgIds = [...orgIdBySlug.values()];

	await prisma.$transaction(async (tx) => {
		await tx.booking.deleteMany({ where: { organizationId: demoOrgId } });
		await tx.customer.deleteMany({ where: { organizationId: demoOrgId } });
		await tx.staffMember.deleteMany({ where: { organizationId: demoOrgId } });
		await tx.organizationSettings.deleteMany({
			where: { organizationId: { in: allOrgIds } },
		});
		await tx.activity.deleteMany({
			where: { organizationId: { in: allOrgIds } },
		});
	});

	for (const p of PARTNER_ORGS) {
		const oid = orgIdBySlug.get(p.slug);
		if (!oid) throw new Error(`Missing org id for slug: ${p.slug}`);
		await prisma.organizationSettings.create({
        data: {
				organizationId: oid,
				businessName: p.businessName,
				activities: p.settingsActivities,
				pricingPresets: p.pricingPresets,
        },
      });

		for (const spec of p.activities) {
			await prisma.activity.create({
          data: {
					organizationId: oid,
					name: spec.name,
					kind: spec.kind,
					pricingKind: spec.pricingKind,
					capacity: spec.capacity ?? null,
					resourceCapacity: spec.resourceCapacity ?? null,
					fixedSlots: spec.fixedSlots ?? [],
					durationOptions: spec.durationOptions ?? [1, 2, 3],
					defaultDurationDays: spec.defaultDurationDays ?? 1,
					defaultPriceMad: spec.defaultPriceMad,
					sortOrder: spec.sortOrder,
					requiresGuide: spec.requiresGuide ?? false,
					requiresTransport: spec.requiresTransport ?? false,
					requiresEquipment: spec.requiresEquipment ?? false,
					isActive: true,
          },
        });
      }
	}

	const demoActivities = await prisma.activity.findMany({
		where: { organizationId: demoOrgId },
		orderBy: { sortOrder: "asc" },
	});

	const staffSpecs: {
		name: string;
		role: "GUIDE" | "DRIVER" | "COORDINATOR";
		phone: string;
	}[] = [
		{ name: "Hicham B.", role: "GUIDE", phone: "+212661111001" },
		{ name: "Salma K.", role: "GUIDE", phone: "+212662222002" },
		{ name: "Karim L.", role: "DRIVER", phone: "+212663333003" },
		{ name: "Driss M.", role: "DRIVER", phone: "+212664444004" },
		{ name: "Nadia R.", role: "COORDINATOR", phone: "+212665555005" },
		{ name: "Younes S.", role: "GUIDE", phone: "+212666666006" },
		{ name: "Imane T.", role: "DRIVER", phone: "+212667777007" },
		{ name: "Mehdi Z.", role: "GUIDE", phone: "+212668888008" },
	];

	const staffRows = await Promise.all(
		staffSpecs.map((s) =>
			prisma.staffMember.create({
				data: {
					organizationId: demoOrgId,
					name: s.name,
					role: s.role,
					phone: s.phone,
					isActive: Math.random() > 0.08,
				},
				select: { id: true, role: true, isActive: true },
			}),
		),
	);

	const activeStaff = staffRows.filter((s) => s.isActive);

	const customers: { id: string; name: string; phone: string }[] = [];
	const usedPhones = new Set<string>();

	for (let i = 0; i < 48; i++) {
		const fn = randomPick(FIRST_NAMES);
		const ln = randomPick(LAST_NAMES);
		const name = `${fn} ${ln}${i > 15 ? ` ${i}` : ""}`;
		let phone: string;
		do {
			phone = `+2126${String(randomInt(10_000_000, 99_999_999)).padStart(8, "0")}`;
		} while (usedPhones.has(phone));
		usedPhones.add(phone);

		const c = await prisma.customer.create({
			data: {
				organizationId: demoOrgId,
				name,
				phone,
				notes: randomPick(CUSTOMER_NOTES),
			},
			select: { id: true, name: true, phone: true },
		});
		customers.push(c);
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const statusWeights: {
		status: BookingStatus;
		payment: PaymentStatus;
		weight: number;
	}[] = [
		{ status: "NEW", payment: "UNPAID", weight: 12 },
		{ status: "PENDING", payment: "UNPAID", weight: 10 },
		{ status: "PENDING", payment: "DEPOSIT", weight: 6 },
		{ status: "CONFIRMED", payment: "DEPOSIT", weight: 14 },
		{ status: "CONFIRMED", payment: "PAID", weight: 18 },
		{ status: "CANCELLED", payment: "UNPAID", weight: 5 },
		{ status: "CANCELLED", payment: "DEPOSIT", weight: 2 },
	];

	function pickStatusPayment(): {
		status: BookingStatus;
		payment: PaymentStatus;
	} {
		const total = statusWeights.reduce((s, x) => s + x.weight, 0);
		let r = Math.random() * total;
		for (const row of statusWeights) {
			r -= row.weight;
			if (r <= 0) return { status: row.status, payment: row.payment };
		}
		return { status: "CONFIRMED", payment: "PAID" };
	}

	let bookingCount = 0;

	for (let i = 0; i < 95; i++) {
		const cust = randomPick(customers);
		const { status, payment } = pickStatusPayment();

		const dayOffset =
			randomInt(0, 10) < 3
				? randomInt(-45, -1)
				: randomInt(0, 10) < 6
					? randomInt(-7, 21)
					: randomInt(22, 90);

		const base = addDays(today, dayOffset);
		const hour = randomPick([8, 9, 10, 11, 14, 15, 16, 17, 18]);
		const minute = randomPick([0, 15, 30, 45]);

		const useCatalog = Math.random() > 0.28;
		const act = useCatalog ? randomPick(demoActivities) : null;

		let activityTitle = randomPick(ACTIVITIES_FALLBACK_TITLES);
		let activityId: string | null = null;
		let activityKind: ActivityKind | null = null;
		let endAt: Date | null = null;
		let meta: Prisma.InputJsonValue | null = null;

		let startAt = atHour(base, hour, minute);

		if (act) {
			activityId = act.id;
			activityKind = act.kind;
			activityTitle = act.name;

			if (act.kind === "FIXED_SLOT") {
				const slots = Array.isArray(act.fixedSlots)
					? (act.fixedSlots as string[])
					: ["09:00"];
				const slot = randomPick(slots.length > 0 ? slots : ["09:00"]);
				meta = { slotTime: slot };
				const parts = slot.split(":");
				const hNum = Number.parseInt(parts[0] ?? "9", 10);
				const mNum = Number.parseInt(parts[1] ?? "0", 10);
				startAt = atHour(
					base,
					Number.isNaN(hNum) ? 9 : hNum,
					Number.isNaN(mNum) ? 0 : mNum,
				);
			} else if (act.kind === "MULTI_DAY") {
				const dd = randomPick([2, 3, 5]);
				meta = { durationDays: dd };
				startAt = atHour(base, 9, 0);
				endAt = multiDayEndAt(startAt, dd);
			} else if (act.kind === "RESOURCE_BASED") {
				meta = { resourceUnits: randomInt(1, 4) };
			}
		}

		const peopleCount = randomInt(1, 8);
		const priceMad =
			act?.defaultPriceMad != null && Math.random() > 0.45
				? act.defaultPriceMad
				: randomInt(250, 3500);
		const priceCents = priceMad * 100;

		let depositCents: number | null = null;
		if (payment === "DEPOSIT") {
			depositCents = Math.round(
				priceCents * randomPick([0.15, 0.2, 0.25, 0.3, 0.5]),
			);
		}
		if (payment === "UNPAID" && status === "PENDING" && Math.random() > 0.5) {
			depositCents = Math.round(priceCents * 0.2);
		}

		const booking = await prisma.booking.create({
			data: {
				organizationId: demoOrgId,
				customerId: cust.id,
				activityId,
				activityKind,
				activityTitle,
				startAt,
				endAt,
				meta: meta ?? undefined,
				peopleCount,
				priceCents,
				status,
				paymentStatus: payment,
				depositCents,
			},
			select: { id: true, status: true, startAt: true },
		});
		bookingCount++;

		if (status !== "CANCELLED" && Math.random() > 0.35) {
			const nMsgs = randomInt(1, 4);
			for (let m = 0; m < nMsgs; m++) {
				const sender = m % 2 === 0 ? "OPERATOR" : "CUSTOMER";
				const body =
					sender === "OPERATOR"
						? randomPick(OPERATOR_SNIPPETS)
						: randomPick(CUSTOMER_MSGS);
				await prisma.bookingMessage.create({
					data: {
						bookingId: booking.id,
						sender,
						body,
        },
      });
    }
  }

		if (
			activeStaff.length > 0 &&
			(status === "CONFIRMED" || status === "PENDING") &&
			startAt >= addDays(today, -1) &&
			Math.random() > 0.55
		) {
			const guide =
				randomPick(activeStaff.filter((s) => s.role === "GUIDE")) ??
				randomPick(activeStaff);
			const driver = randomPick(activeStaff.filter((s) => s.role === "DRIVER"));

			await prisma.bookingAssignment.create({
				data: {
					bookingId: booking.id,
					staffMemberId: guide.id,
					assignmentRole: "Lead guide",
					notes: Math.random() > 0.5 ? "Meet at main square" : null,
      },
    });

			if (driver && Math.random() > 0.45) {
				await prisma.bookingAssignment
					.create({
						data: {
							bookingId: booking.id,
							staffMemberId: driver.id,
							assignmentRole: "Driver",
							notes: null,
						},
					})
					.catch(() => {
						/* unique booking+staff */
					});
			}
		}
	}

	console.log(
		`Demo org (${DEMO_ORG_SLUG}): ${customers.length} customers, ${bookingCount} bookings, ${staffRows.length} staff, ${demoActivities.length} catalog activities.`,
	);

	for (const [slug, oid] of orgIdBySlug) {
		if (slug === DEMO_ORG_SLUG) continue;

		const existingBookings = await prisma.booking.count({
			where: { organizationId: oid },
		});
		if (existingBookings > 0) continue;

		const customer1 = await prisma.customer.create({
			data: {
				organizationId: oid,
				name: "Demo Visitor",
				phone: "+212600000099",
				notes: null,
			},
			select: { id: true },
		});

		await prisma.booking.create({
        data: {
				organizationId: oid,
				customerId: customer1.id,
				activityTitle: "Sample Activity",
				startAt: atHour(addDays(new Date(), 3), 10, 0),
				peopleCount: 2,
				priceCents: 500 * 100,
				status: "NEW",
				paymentStatus: "UNPAID",
				depositCents: null,
        },
      });
    }

	const totalActivities = await prisma.activity.count();
	console.log(`Marketplace activities (all orgs): ${totalActivities}`);
	const primaryPartner = PARTNER_ORGS[0];
	console.log(
		"Done. Partner:",
		primaryPartner?.userEmail ?? "(none)",
		"/",
		SEED_PASSWORD,
	);
	console.log("Admin: admin@tourismos.ma /", SEED_PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
		void prisma.$disconnect();
    process.exit(1);
  });
