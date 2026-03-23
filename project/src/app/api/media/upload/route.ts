import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import {
	getSupportedUploadTypes,
	getUploadConfig,
	processUpload,
	type UploadPayload,
	type UploadType,
} from "~/lib/media-server";

const SUPPORTED = getSupportedUploadTypes();

/** Normalize FormData file to payload. Handles File/Blob; never throws - returns null if unsupported or read fails. */
async function formFileToPayload(
	formFile: unknown,
): Promise<UploadPayload | null> {
	if (!formFile || typeof formFile !== "object") return null;
	const blob = formFile as Blob;
	if (typeof blob.arrayBuffer !== "function" || typeof blob.size !== "number")
		return null;
	try {
		const buffer = Buffer.from(await blob.arrayBuffer());
		const contentType = blob.type || "application/octet-stream";
		const suggestedName = formFile instanceof File ? formFile.name : "file";
		return { buffer, contentType, size: blob.size, suggestedName };
	} catch {
		return null;
	}
}

export async function POST(request: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "You must be signed in to upload." },
				{ status: 401 },
			);
		}
		const userId = session.user.id;

		let formData: FormData;
		try {
			formData = await request.formData();
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Failed to parse request body.";
			const isTooLarge = /body|size|limit|length|aborted/i.test(msg);
			return NextResponse.json(
				{ error: isTooLarge ? "Request body too large or invalid." : msg },
				{ status: isTooLarge ? 413 : 400 },
			);
		}

		const type = formData.get("type");
		if (typeof type !== "string" || !type) {
			return NextResponse.json(
				{ error: `Missing "type". Supported: ${SUPPORTED.join(", ")}.` },
				{ status: 400 },
			);
		}

		if (!getUploadConfig(type)) {
			return NextResponse.json(
				{
					error: `Unsupported type "${type}". Supported: ${SUPPORTED.join(", ")}.`,
				},
				{ status: 400 },
			);
		}

		const file = formData.get("file");
		const payload = await formFileToPayload(file);
		if (!payload) {
			return NextResponse.json(
				{ error: "Please select a valid file." },
				{ status: 400 },
			);
		}

		const result = await processUpload(type as UploadType, userId, payload);

		if ("error" in result) {
			const status = result.error.includes("not configured")
				? 503
				: result.error.includes("not found")
					? 502
					: result.error.includes("Invalid") ||
							result.error.includes("empty") ||
							result.error.includes("large")
						? 400
						: 500;
			return NextResponse.json({ error: result.error }, { status });
		}

		return NextResponse.json({ url: result.url });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Upload failed.";
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
