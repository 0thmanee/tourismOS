import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { importPKCS8, SignJWT } from "jose";
import { bearer, organization } from "better-auth/plugins";
import { prisma } from "~/lib/db";
import { env } from "~/env";
import {
	buildVerificationEmailContent,
	sendVerificationEmail,
} from "~/lib/email";

async function generateAppleClientSecret(): Promise<string> {
	const clientId = env.APPLE_CLIENT_ID;
	const teamId = env.APPLE_TEAM_ID;
	const keyId = env.APPLE_KEY_ID;
	const privateKeyRaw = env.APPLE_PRIVATE_KEY;
	if (!clientId || !teamId || !keyId || !privateKeyRaw) {
		throw new Error("Missing Apple OAuth env (APPLE_CLIENT_ID, TEAM_ID, KEY_ID, PRIVATE_KEY)");
	}
	const pem = privateKeyRaw.includes("BEGIN PRIVATE KEY")
		? privateKeyRaw
		: `-----BEGIN PRIVATE KEY-----\n${privateKeyRaw}\n-----END PRIVATE KEY-----`;
	const key = await importPKCS8(pem, "ES256");
	const now = Math.floor(Date.now() / 1000);
	return new SignJWT({})
		.setProtectedHeader({ alg: "ES256", kid: keyId })
		.setIssuer(teamId)
		.setSubject(clientId)
		.setAudience("https://appleid.apple.com")
		.setIssuedAt(now)
		.setExpirationTime(now + 180 * 24 * 60 * 60)
		.sign(key);
}

const googleOAuthConfigured = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

const appleOAuthConfigured = Boolean(
	env.APPLE_CLIENT_ID &&
		env.APPLE_TEAM_ID &&
		env.APPLE_KEY_ID &&
		env.APPLE_PRIVATE_KEY,
);

const appleClientSecret = appleOAuthConfigured
	? await generateAppleClientSecret()
	: "";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		// Without Resend, verification emails are skipped; don't block sign-in in that mode.
		requireEmailVerification: Boolean(env.RESEND_API_KEY),
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
		bearer(),
		nextCookies(), // must be last: required for Server Actions that set cookies
	],
	socialProviders: {
		...(googleOAuthConfigured
			? {
					google: {
						clientId: env.GOOGLE_CLIENT_ID as string,
						clientSecret: env.GOOGLE_CLIENT_SECRET as string,
					},
				}
			: {}),
		...(appleOAuthConfigured
			? {
					apple: {
						clientId: env.APPLE_CLIENT_ID as string,
						clientSecret: appleClientSecret,
						...(env.APPLE_APP_BUNDLE_IDENTIFIER
							? {
									appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER,
								}
							: {}),
					},
				}
			: {}),
	},
	trustedOrigins: [
		env.BETTER_AUTH_URL,
		...(appleOAuthConfigured ? ["https://appleid.apple.com"] : []),
	],
});
