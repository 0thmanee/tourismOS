/**
 * TourismOS seed:
 * - Admin user
 * - Partner orgs (organization + users + profiles + members)
 * - Booking inbox MVP: Customer + Booking + BookingMessage
 *
 * Run: pnpm prisma db seed
 * Default password: Password123!
 */

import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
  log: ["error"],
});

const SEED_PASSWORD = "Password123!";

async function main() {
  const hashedPassword = await hashPassword(SEED_PASSWORD);

  // —— 1) Admin user ——
  const admin = await prisma.user.upsert({
    where: { email: "admin@origine-maroc.ma" },
    update: {},
    create: {
      name: "Admin OrigineMaroc",
      email: "admin@origine-maroc.ma",
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
    { orgName: "Coopérative Agrumes Souss", slug: "coop-agrumes-souss", userEmail: "contact@coop-agrumes.ma", userName: "Rachid El Amrani" },
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
        categories: ["Agrumes", "Dattes"],
        agreeTerms: true,
        agreeMarketing: false,
      },
    });
  }

  console.log("Partners:", partners.length, "orgs with users and profiles");

  // —— 3) Tourism bookings (Inbox MVP) ——
  for (const orgId of orgIds) {
    const existingBookings = await prisma.booking.count({ where: { organizationId: orgId } });
    if (existingBookings > 0) continue;

    const now = new Date();

    const customer1 = await prisma.customer.create({
      data: { organizationId: orgId, name: "Ahmed", phone: "+212600000001", notes: null },
      select: { id: true },
    });
    const customer2 = await prisma.customer.create({
      data: { organizationId: orgId, name: "John", phone: "+212600000002", notes: null },
      select: { id: true },
    });

    const start1 = new Date(now);
    start1.setDate(start1.getDate() + 1);
    start1.setHours(10, 0, 0, 0);

    const start2 = new Date(now);
    start2.setDate(start2.getDate() + 2);
    start2.setHours(14, 0, 0, 0);

    // NEW booking
    await prisma.booking.create({
      data: {
        organizationId: orgId,
        customerId: customer1.id,
        activityTitle: "Desert Tour",
        startAt: start1,
        peopleCount: 2,
        priceCents: 800 * 100,
        status: "NEW",
        paymentStatus: "UNPAID",
        depositCents: null,
      },
    });

    // CONFIRMED booking with one message
    const booking2 = await prisma.booking.create({
      data: {
        organizationId: orgId,
        customerId: customer2.id,
        activityTitle: "Quad Bike",
        startAt: start2,
        peopleCount: 4,
        priceCents: 1200 * 100,
        status: "CONFIRMED",
        paymentStatus: "DEPOSIT",
        depositCents: null,
      },
      select: { id: true },
    });

    await prisma.bookingMessage.create({
      data: {
        bookingId: booking2.id,
        sender: "OPERATOR",
        body: "Confirmed. We will reach out for pickup details.",
      },
    });
  }

  console.log("Bookings seeded for inbox MVP");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

