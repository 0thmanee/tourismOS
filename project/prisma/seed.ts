/**
 * TourismOS seed — rich demo data for dashboard / inbox / calendar / payments testing.
 *
 * - Superadmin + partner orgs (unchanged emails)
 * - **Demo org** (`coop-agrumes-souss`): wipes & re-seeds customers, bookings, messages, staff, settings
 * - Other partner orgs: light touch (only seed if empty)
 *
 * Run: pnpm prisma db seed
 * Default password: Password123!
 */

import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { type Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
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

const ACTIVITIES = [
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

async function main() {
  const hashedPassword = await hashPassword(SEED_PASSWORD);

  // —— 1) Admin user ——
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
    where: { userId: admin.id, providerId: "credential", accountId: admin.email },
  });
  if (adminAccount) {
    await prisma.account.update({ where: { id: adminAccount.id }, data: { password: hashedPassword } });
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

  // —— 2) Partner organizations + users + profiles + members ——
  const partners: { orgName: string; slug: string; userEmail: string; userName: string }[] = [
    { orgName: "Coopérative Agrumes Souss", slug: DEMO_ORG_SLUG, userEmail: "contact@coop-agrumes.ma", userName: "Rachid El Amrani" },
    { orgName: "Biodattes Tafilalet", slug: "biodattes-tafilalet", userEmail: "info@biodattes.ma", userName: "Fatima Bennani" },
    { orgName: "Huile d'Argane Aït Baâmrane", slug: "huile-argane-ait-baamrane", userEmail: "hello@argane-ab.ma", userName: "Mohammed Idrissi" },
    { orgName: "Miel & Thym Atlas", slug: "miel-thym-atlas", userEmail: "contact@miel-atlas.ma", userName: "Khadija Tazi" },
  ];

  const orgIds: string[] = [];

  for (const p of partners) {
    const org = await prisma.organization.upsert({
      where: { slug: p.slug },
      update: {},
      create: { name: p.orgName, slug: p.slug },
    });
    orgIds.push(org.id);

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

    const partnerAccount = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential", accountId: user.email },
    });
    if (partnerAccount) {
      await prisma.account.update({ where: { id: partnerAccount.id }, data: { password: hashedPassword } });
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
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
      update: {},
      create: {
        organizationId: org.id,
        userId: user.id,
        role: "owner",
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: p.userName.split(" ")[0] ?? p.userName,
        lastName: p.userName.split(" ").slice(1).join(" ") || "—",
        phone: "+212 6XX XXX XXX",
        entityType: orgIds[0] === org.id ? "Cooperative" : "Company / SARL",
        entityName: p.orgName,
        region: "Souss-Massa",
        city: "Agadir",
        categories: ["Agrumes", "Dattes", "Tours"],
        agreeTerms: true,
        agreeMarketing: false,
      },
    });
  }

  console.log("Partners:", partners.length, "orgs with users and profiles");

  const demoOrg = await prisma.organization.findUniqueOrThrow({ where: { slug: DEMO_ORG_SLUG } });

  // —— 3) Wipe demo org operational data (re-runnable seed) ——
  await prisma.$transaction([
    prisma.bookingAssignment.deleteMany({ where: { booking: { organizationId: demoOrg.id } } }),
    prisma.booking.deleteMany({ where: { organizationId: demoOrg.id } }), // cascades messages
    prisma.activity.deleteMany({ where: { organizationId: demoOrg.id } }),
    prisma.customer.deleteMany({ where: { organizationId: demoOrg.id } }),
    prisma.staffMember.deleteMany({ where: { organizationId: demoOrg.id } }),
    prisma.organizationSettings.deleteMany({ where: { organizationId: demoOrg.id } }),
  ]);

  // —— 4) Organization settings (dashboard: settings page) ——
  await prisma.organizationSettings.create({
    data: {
      organizationId: demoOrg.id,
      businessName: "Souss Experience Tours",
      activities: [
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
    },
  });

  // —— 5) Staff (team + assignments) ——
  const staffSpecs: { name: string; role: "GUIDE" | "DRIVER" | "COORDINATOR"; phone: string }[] = [
    { name: "Hicham B.", role: "GUIDE", phone: "+212 661 111 001" },
    { name: "Salma K.", role: "GUIDE", phone: "+212 662 222 002" },
    { name: "Karim L.", role: "DRIVER", phone: "+212 663 333 003" },
    { name: "Driss M.", role: "DRIVER", phone: "+212 664 444 004" },
    { name: "Nadia R.", role: "COORDINATOR", phone: "+212 665 555 005" },
    { name: "Younes S.", role: "GUIDE", phone: "+212 666 666 006" },
    { name: "Imane T.", role: "DRIVER", phone: "+212 667 777 007" },
    { name: "Mehdi Z.", role: "GUIDE", phone: "+212 668 888 008" },
  ];

  const staffRows = await Promise.all(
    staffSpecs.map((s) =>
      prisma.staffMember.create({
        data: {
          organizationId: demoOrg.id,
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

  // —— 5b) Activity catalog (fixed / flexible / multi-day / resource) ——
  const demoActivities = await Promise.all([
    prisma.activity.create({
      data: {
        organizationId: demoOrg.id,
        name: "Desert sunrise — fixed departures",
        kind: "FIXED_SLOT",
        pricingKind: "PER_PERSON",
        capacity: 14,
        fixedSlots: ["06:00", "08:00", "10:00"],
        defaultPriceMad: 850,
        sortOrder: 1,
      },
    }),
    prisma.activity.create({
      data: {
        organizationId: demoOrg.id,
        name: "Quad & palmeraie — on request",
        kind: "FLEXIBLE",
        pricingKind: "PER_PERSON",
        capacity: 8,
        defaultPriceMad: 650,
        sortOrder: 2,
      },
    }),
    prisma.activity.create({
      data: {
        organizationId: demoOrg.id,
        name: "Atlas & Berber villages trek",
        kind: "MULTI_DAY",
        pricingKind: "PER_PERSON",
        capacity: 10,
        durationOptions: [2, 3, 5],
        defaultDurationDays: 3,
        defaultPriceMad: 2400,
        sortOrder: 3,
      },
    }),
    prisma.activity.create({
      data: {
        organizationId: demoOrg.id,
        name: "Surf gear — half-day rental",
        kind: "RESOURCE_BASED",
        pricingKind: "PER_GROUP",
        resourceCapacity: 6,
        defaultPriceMad: 400,
        sortOrder: 4,
      },
    }),
  ]);

  function multiDayEndAt(startAt: Date, durationDays: number): Date {
    const end = new Date(startAt);
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + Math.max(1, durationDays) - 1);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  // —— 6) Customers ——
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
        organizationId: demoOrg.id,
        name,
        phone,
        notes: randomPick(CUSTOMER_NOTES),
      },
      select: { id: true, name: true, phone: true },
    });
    customers.push(c);
  }

  // —— 7) Bookings —— spread across past / today / future, all statuses & payments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statusWeights: { status: BookingStatus; payment: PaymentStatus; weight: number }[] = [
    { status: "NEW", payment: "UNPAID", weight: 12 },
    { status: "PENDING", payment: "UNPAID", weight: 10 },
    { status: "PENDING", payment: "DEPOSIT", weight: 6 },
    { status: "CONFIRMED", payment: "DEPOSIT", weight: 14 },
    { status: "CONFIRMED", payment: "PAID", weight: 18 },
    { status: "CANCELLED", payment: "UNPAID", weight: 5 },
    { status: "CANCELLED", payment: "DEPOSIT", weight: 2 },
  ];

  function pickStatusPayment(): { status: BookingStatus; payment: PaymentStatus } {
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

    // Day offset: heavy around this week, some past, some future
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

    let activityTitle = randomPick(ACTIVITIES);
    let activityId: string | null = null;
    let activityKind: "FIXED_SLOT" | "FLEXIBLE" | "MULTI_DAY" | "RESOURCE_BASED" | null =
      null;
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
        const slot = randomPick(slots);
        meta = { slotTime: slot } as Prisma.InputJsonValue;
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
        meta = { durationDays: dd } as Prisma.InputJsonValue;
        startAt = atHour(base, 9, 0);
        endAt = multiDayEndAt(startAt, dd);
      } else if (act.kind === "RESOURCE_BASED") {
        meta = { resourceUnits: randomInt(1, 4) } as Prisma.InputJsonValue;
      }
    }

    const peopleCount = randomInt(1, 8);
    let priceMad =
      act?.defaultPriceMad != null && Math.random() > 0.45
        ? act.defaultPriceMad
        : randomInt(250, 3500);
    const priceCents = priceMad * 100;

    let depositCents: number | null = null;
    if (payment === "DEPOSIT") {
      depositCents = Math.round(priceCents * randomPick([0.15, 0.2, 0.25, 0.3, 0.5]));
    }
    if (payment === "UNPAID" && status === "PENDING" && Math.random() > 0.5) {
      depositCents = Math.round(priceCents * 0.2);
    }

    const booking = await prisma.booking.create({
      data: {
        organizationId: demoOrg.id,
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

    // Messages: richer on non-cancelled
    if (status !== "CANCELLED" && Math.random() > 0.35) {
      const nMsgs = randomInt(1, 4);
      for (let m = 0; m < nMsgs; m++) {
        const sender = m % 2 === 0 ? "OPERATOR" : "CUSTOMER";
        const body =
          sender === "OPERATOR" ? randomPick(OPERATOR_SNIPPETS) : randomPick(CUSTOMER_MSGS);
        await prisma.bookingMessage.create({
          data: {
            bookingId: booking.id,
            sender,
            body,
          },
        });
      }
    }

    // Assign staff to some confirmed / pending future-ish bookings
    if (
      activeStaff.length > 0 &&
      (status === "CONFIRMED" || status === "PENDING") &&
      startAt >= addDays(today, -1) &&
      Math.random() > 0.55
    ) {
      const guide = randomPick(activeStaff.filter((s) => s.role === "GUIDE")) ?? randomPick(activeStaff);
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

  console.log(`Demo org (${DEMO_ORG_SLUG}): seeded ${customers.length} customers, ${bookingCount} bookings, ${staffRows.length} staff.`);

  // —— 8) Other orgs: minimal seed if empty (smoke test) ——
  for (const orgId of orgIds) {
    if (orgId === demoOrg.id) continue;

    const existingBookings = await prisma.booking.count({ where: { organizationId: orgId } });
    if (existingBookings > 0) continue;

    const now = new Date();
    const customer1 = await prisma.customer.create({
      data: { organizationId: orgId, name: "Demo Visitor", phone: "+212600000099", notes: null },
      select: { id: true },
    });

    await prisma.booking.create({
      data: {
        organizationId: orgId,
        customerId: customer1.id,
        activityTitle: "Sample Activity",
        startAt: atHour(addDays(now, 3), 10, 0),
        peopleCount: 2,
        priceCents: 500 * 100,
        status: "NEW",
        paymentStatus: "UNPAID",
        depositCents: null,
      },
    });
  }

  console.log("Done. Login partner:", partners[0]!.userEmail, "/", SEED_PASSWORD);
  console.log("Login admin: admin@tourismos.ma /", SEED_PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
