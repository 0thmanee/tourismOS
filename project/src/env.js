import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]),
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().url(),
		/** Web OAuth client (used for Google sign-in flows). */
		GOOGLE_CLIENT_ID: z.string().min(1).optional(),
		GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
		/**
		 * Apple Sign In (web / service identifier). Also set APPLE_APP_BUNDLE_IDENTIFIER
		 * to your iOS app bundle id when verifying native ID tokens.
		 */
		APPLE_CLIENT_ID: z.string().min(1).optional(),
		APPLE_TEAM_ID: z.string().min(1).optional(),
		APPLE_KEY_ID: z.string().min(1).optional(),
		/** PKCS#8 (.p8) private key contents, with optional PEM headers. */
		APPLE_PRIVATE_KEY: z.string().min(1).optional(),
		APPLE_APP_BUNDLE_IDENTIFIER: z.string().min(1).optional(),
		RESEND_API_KEY: z.string().optional(),
		/** Verified sender (e.g. noreply@yourdomain.com). Defaults to Resend's test address when unset. */
		RESEND_FROM_EMAIL: z.string().email().optional(),
		/** Supabase Storage — project URL and service role key for server-side uploads. */
		SUPABASE_URL: z.string().url().optional(),
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
		/** Supabase Storage bucket name for all media (e.g. profile pictures, product images). Must exist and be public. */
		SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		/** Supabase project URL — used to build public image URLs for display. */
		NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
		APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
		APPLE_KEY_ID: process.env.APPLE_KEY_ID,
		APPLE_PRIVATE_KEY: process.env.APPLE_PRIVATE_KEY,
		APPLE_APP_BUNDLE_IDENTIFIER: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
		SUPABASE_URL: process.env.SUPABASE_URL,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true,
});
