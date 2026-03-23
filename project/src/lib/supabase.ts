import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

/**
 * Server-side Supabase client with service role (for uploads).
 * Only available when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 */
export function getSupabaseServer() {
	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) return null;
	return createClient(url, key);
}

/**
 * Build the public URL for a file in any Storage bucket.
 * Use when storing the URL in DB so it works across envs (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL).
 */
export function getStoragePublicUrl(bucket: string, path: string): string {
	const base = env.NEXT_PUBLIC_SUPABASE_URL ?? env.SUPABASE_URL;
	if (!base) return "";
	const clean = base.replace(/\/$/, "");
	return `${clean}/storage/v1/object/public/${bucket}/${path}`;
}
