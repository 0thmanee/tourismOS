import { NextResponse } from "next/server";

export type ApiErrorBody = {
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
};

function parseAllowedOrigins(): string[] | "*" {
	const raw = process.env.B2C_ALLOWED_ORIGINS?.trim();
	if (!raw || raw === "*") return "*";
	return raw
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

/** CORS for public B2C JSON (optional; native apps do not require CORS). */
export function v1CorsHeaders(request: Request): HeadersInit {
	const allowed = parseAllowedOrigins();
	const origin = request.headers.get("origin");
	const base: Record<string, string> = {
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};
	if (allowed === "*") {
		return {
			...base,
			"Access-Control-Allow-Origin": "*",
		};
	}
	const headers: Record<string, string> = {
		...base,
		Vary: "Origin",
	};
	if (origin && allowed.includes(origin))
		headers["Access-Control-Allow-Origin"] = origin;
	return headers;
}

export function v1OptionsResponse(request: Request) {
	return new NextResponse(null, {
		status: 204,
		headers: v1CorsHeaders(request),
	});
}

export function jsonV1Error(
	request: Request,
	status: number,
	code: string,
	message: string,
	details?: unknown,
) {
	const body: ApiErrorBody = {
		error: {
			code,
			message,
			...(details !== undefined ? { details } : {}),
		},
	};
	return NextResponse.json(body, {
		status,
		headers: v1CorsHeaders(request),
	});
}

export function jsonV1Ok<T>(
	request: Request,
	body: T,
	init?: { status?: number },
) {
	return NextResponse.json(body, {
		status: init?.status ?? 200,
		headers: v1CorsHeaders(request),
	});
}
