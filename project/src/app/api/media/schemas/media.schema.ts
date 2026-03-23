/**
 * Single source of truth for media upload types.
 * When adding a new type: add here, then add bucket + config in lib/media-server.ts.
 */

export const MEDIA_UPLOAD_TYPES = [
	"profilePictures",
	"productImages",
	"certificationDocuments",
	"trainingProgramMedia",
] as const;

export type UploadMediaType = (typeof MEDIA_UPLOAD_TYPES)[number];

/** Allowed MIME types for certification uploads (PDF and images only). Use for accept attribute and client validation. */
export const CERTIFICATION_ALLOWED_MIMES = [
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

export const CERTIFICATION_ACCEPT =
	"application/pdf,image/jpeg,image/png,image/webp";

/** All media types for training program content (video, PDF, images). */
export const TRAINING_PROGRAM_MEDIA_MIMES = [
	"video/mp4",
	"video/webm",
	"application/pdf",
	"image/jpeg",
	"image/png",
	"image/webp",
] as const;

export const TRAINING_PROGRAM_MEDIA_ACCEPT =
	"video/mp4,video/webm,application/pdf,image/jpeg,image/png,image/webp";
