/**
 * Global media manager: client-side API for uploads.
 * All media goes through POST /api/media/upload. Types match server (media-server.ts).
 * This layer only uploads and returns a URL; features decide what to do with it (e.g. save to profile).
 */

import type { UploadMediaType } from "~/app/api/media/schemas/media.schema";

const MEDIA_UPLOAD_URL = "/api/media/upload";

export type { UploadMediaType };

/**
 * Upload a file to the global media endpoint. Returns the public URL on success.
 * Throws an Error with message on failure (for React Query mutation).
 */
export async function uploadMedia(
	file: File,
	type: UploadMediaType,
): Promise<{ url: string }> {
	const formData = new FormData();
	formData.set("file", file);
	formData.set("type", type);
	const res = await fetch(MEDIA_UPLOAD_URL, { method: "POST", body: formData });
	const data = (await res.json()) as { error?: string; url?: string };
	if (!res.ok) {
		throw new Error(data.error ?? "Upload failed. Please try again.");
	}
	if (data.url) return { url: data.url };
	throw new Error("Upload failed. Please try again.");
}
