/**
 * Global media upload: config and storage only.
 * - Bucket and validation come from env (SUPABASE_STORAGE_BUCKET, optional MEDIA_*).
 * - Paths are generic: {typeSegment}/{userId}/{filename}; type segment is derived from upload type (camelCase → kebab-case).
 * - No hardcoded bucket or folder names; add upload types in api/media/schemas/media.schema.ts and config below.
 */

import type { UploadMediaType } from "~/app/api/media/schemas/media.schema";
import { MEDIA_UPLOAD_TYPES } from "~/app/api/media/schemas/media.schema";
import { env } from "~/env";
import { getStoragePublicUrl, getSupabaseServer } from "~/lib/supabase";

/** camelCase → kebab-case for path segment (e.g. profilePictures → profile-pictures). */
function typeToPathSegment(type: string): string {
	return (
		type
			.replace(/([A-Z])/g, "-$1")
			.toLowerCase()
			.replace(/^-/, "") || type
	);
}

export type UploadType = UploadMediaType;

export type UploadTypeConfig = {
	allowedMimeTypes: readonly string[];
	maxSizeBytes: number;
	/** "single" = one file per user (e.g. avatar); "unique" = new id per upload. */
	pathStrategy: "single" | "unique";
};

const DEFAULT_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024; // 5MB
const PDF_MIMES = ["application/pdf"] as const;
const CERT_DOC_MAX_BYTES = 10 * 1024 * 1024; // 10MB for PDFs
const VIDEO_MIMES = ["video/mp4", "video/webm"] as const;
const TRAINING_MEDIA_MAX_BYTES = 100 * 1024 * 1024; // 100MB for video

/** Per-type validation and path strategy only. Bucket and path segment are generic. */
const CONFIG: Record<UploadMediaType, UploadTypeConfig> = {
	profilePictures: {
		allowedMimeTypes: DEFAULT_MIMES,
		maxSizeBytes: DEFAULT_MAX_BYTES,
		pathStrategy: "single",
	},
	productImages: {
		allowedMimeTypes: DEFAULT_MIMES,
		maxSizeBytes: DEFAULT_MAX_BYTES,
		pathStrategy: "unique",
	},
	certificationDocuments: {
		allowedMimeTypes: [...PDF_MIMES, ...DEFAULT_MIMES],
		maxSizeBytes: CERT_DOC_MAX_BYTES,
		pathStrategy: "unique",
	},
	trainingProgramMedia: {
		allowedMimeTypes: [...VIDEO_MIMES, ...PDF_MIMES, ...DEFAULT_MIMES],
		maxSizeBytes: TRAINING_MEDIA_MAX_BYTES,
		pathStrategy: "unique",
	},
};

const IMAGE_EXTS = ["jpeg", "jpg", "png", "webp"];
const DOC_EXTS = ["pdf", ...IMAGE_EXTS];
const VIDEO_EXTS = ["mp4", "webm"];
const TRAINING_EXTS = ["mp4", "webm", "pdf", ...IMAGE_EXTS];

function buildPath(
	type: UploadMediaType,
	userId: string,
	suggestedName: string,
): string {
	const segment = typeToPathSegment(type);
	const rawExt = suggestedName.split(".").pop()?.toLowerCase() || "jpg";
	const config = CONFIG[type];
	const allowedExts =
		type === "certificationDocuments"
			? DOC_EXTS
			: type === "trainingProgramMedia"
				? TRAINING_EXTS
				: IMAGE_EXTS;
	const safeExt = allowedExts.includes(rawExt)
		? rawExt
		: type === "trainingProgramMedia"
			? "mp4"
			: type === "certificationDocuments"
				? "pdf"
				: "jpg";
	if (config.pathStrategy === "single") {
		return `${segment}/${userId}/avatar.${safeExt}`;
	}
	return `${segment}/${userId}/${crypto.randomUUID()}.${safeExt}`;
}

export function getUploadConfig(type: string): UploadTypeConfig | null {
	return type in CONFIG ? (CONFIG[type as UploadType] ?? null) : null;
}

export function getSupportedUploadTypes(): UploadType[] {
	return [...MEDIA_UPLOAD_TYPES];
}

/** Normalized file payload (built in route from FormData so we don't depend on File/Blob in media-server). */
export type UploadPayload = {
	buffer: Buffer;
	contentType: string;
	size: number;
	suggestedName: string;
};

export type ProcessUploadResult = { url: string } | { error: string };

/**
 * Validate payload against type config, upload to Supabase, return public URL.
 * No DB or entity logic; caller saves the URL where needed.
 */
export async function processUpload(
	type: UploadType,
	userId: string,
	payload: UploadPayload,
): Promise<ProcessUploadResult> {
	const config = getUploadConfig(type);
	if (!config) return { error: "Invalid upload type." };

	const { buffer, contentType, size, suggestedName } = payload;

	if (!config.allowedMimeTypes.includes(contentType)) {
		return { error: "Invalid file type for this upload." };
	}
	if (size > config.maxSizeBytes) {
		return { error: "File is too large." };
	}
	if (size === 0) {
		return { error: "File is empty." };
	}

	const bucket = env.SUPABASE_STORAGE_BUCKET;
	if (!bucket) {
		return {
			error:
				"Media upload is not configured. Set SUPABASE_STORAGE_BUCKET (and SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).",
		};
	}

	const supabase = getSupabaseServer();
	if (!supabase) {
		return {
			error:
				"Media upload is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
		};
	}

	const path = buildPath(type, userId, suggestedName);

	const { error: uploadError } = await supabase.storage
		.from(bucket)
		.upload(path, buffer, { contentType, upsert: true });

	if (uploadError) {
		const msg = uploadError.message ?? "Upload failed.";
		if (
			msg.toLowerCase().includes("bucket") &&
			msg.toLowerCase().includes("not found")
		) {
			return {
				error: `Bucket "${bucket}" not found. Create it in Supabase Storage and set SUPABASE_STORAGE_BUCKET.`,
			};
		}
		return { error: msg };
	}

	return { url: getStoragePublicUrl(bucket, path) };
}
