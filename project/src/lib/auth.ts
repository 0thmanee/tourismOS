import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { prisma } from "~/lib/db";
import {
  sendVerificationEmail,
  buildVerificationEmailContent,
} from "~/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const urlObj = new URL(url);
      urlObj.searchParams.set("callbackURL", "/onboarding");
      const verificationUrl = urlObj.toString();
      const { text, html } = buildVerificationEmailContent({
        verificationUrl,
        productName: "TourismOS",
      });
      await sendVerificationEmail({
        to: user.email,
        subject: "Verify your email — TourismOS",
        text,
        html,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "partner",
        input: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "disabled",
        input: false,
      },
      profileCompleted: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;
      // When email verification is required, newSession is null; find user by email from body
      const email = (ctx.body as { email?: string } | undefined)?.email;
      if (!email) return;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return;
      const count = await prisma.user.count();
      if (count === 1) {
        // First user: superadmin, enabled, and skip onboarding (profileCompleted = true)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "superadmin",
            status: "enabled",
            profileCompleted: true,
          } as Parameters<typeof prisma.user.update>[0]["data"],
        });
      }
    }),
  },
  plugins: [
    organization(),
    nextCookies(), // must be last: required for Server Actions that set cookies
  ],
  trustedOrigins: [
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ].filter(Boolean),
});
