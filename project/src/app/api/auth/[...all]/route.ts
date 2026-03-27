import { toNextJsHandler } from "better-auth/next-js";
import { env } from "~/env";
import { auth } from "~/lib/auth";

const handlers = toNextJsHandler(auth);

const REDACTED_KEYS = new Set([
	"password",
	"token",
	"idToken",
	"accessToken",
	"clientSecret",
	"secret",
]);

function redactValue(value: unknown): unknown {
	if (value == null) return value;
	if (typeof value === "string") {
		return value.length > 12 ? `${value.slice(0, 4)}…(${value.length})` : "***";
	}
	if (Array.isArray(value)) return value.map((item) => redactValue(item));
	if (typeof value === "object") {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			out[k] = REDACTED_KEYS.has(k) ? "***" : redactValue(v);
		}
		return out;
	}
	return value;
}

async function readRequestBodyDebug(
	req: Request,
): Promise<Record<string, unknown>> {
	try {
		const rawBody = await req.clone().text();
		if (rawBody.length === 0) return { hasBody: false };
		try {
			const parsed = JSON.parse(rawBody) as Record<string, unknown>;
			return {
				hasBody: true,
				body: redactValue(parsed),
			};
		} catch {
			return {
				hasBody: true,
				bodyRawPreview: rawBody.slice(0, 300),
			};
		}
	} catch {
		return { bodyRead: "failed" };
	}
}

type PatchedRequest = { request: Request; originInjected: boolean };

async function withFallbackOrigin(req: Request): Promise<PatchedRequest> {
	if (req.headers.has("origin")) {
		return { request: req, originInjected: false };
	}
	// Only patch Origin for endpoints that are called by native clients without Origin.
	// Avoid weakening origin validation globally.
	const url = new URL(req.url);
	const endpoint = url.pathname.replace("/api/auth", "") || "/";
	const allowFallback =
		(req.method === "POST" && endpoint === "/sign-in/social") ||
		(req.method === "POST" && endpoint === "/sign-out");
	if (!allowFallback) {
		return { request: req, originInjected: false };
	}
	const headers = new Headers(req.headers);
	headers.set("origin", env.BETTER_AUTH_URL);
	const rawBody = await req.clone().text();
	return {
		request: new Request(req.url, {
			method: req.method,
			headers,
			body: rawBody.length === 0 ? undefined : rawBody,
		}),
		originInjected: true,
	};
}

async function executeWithAuthLogs(
	req: Request,
	execute: (r: Request) => Promise<Response>,
): Promise<Response> {
	const url = new URL(req.url);
	const endpoint = url.pathname.replace("/api/auth", "") || "/";
	const requestId = crypto.randomUUID().slice(0, 8);
	const startedAt = Date.now();
	const debugBody = await readRequestBodyDebug(req);
	const incomingOrigin = req.headers.get("origin");
	const userAgent = req.headers.get("user-agent");
	const referer = req.headers.get("referer");

	console.info(`[auth][${requestId}] ${req.method} ${endpoint} request`, {
		hasOriginHeader: req.headers.has("origin"),
		origin: incomingOrigin,
		userAgent:
			userAgent && userAgent.length > 160
				? `${userAgent.slice(0, 160)}…(${userAgent.length})`
				: userAgent,
		referer:
			referer && referer.length > 200
				? `${referer.slice(0, 200)}…(${referer.length})`
				: referer,
		hasCookieHeader: req.headers.has("cookie"),
		hasAuthorizationHeader: req.headers.has("authorization"),
		...debugBody,
	});

	try {
		const { request: patchedReq, originInjected } =
			await withFallbackOrigin(req);
		const effectiveOrigin = patchedReq.headers.get("origin");
		if (originInjected) {
			console.info(`[auth][${requestId}] origin fallback applied`, {
				endpoint,
				injectedOrigin: effectiveOrigin,
			});
		}
		const response = await execute(patchedReq);
		const elapsedMs = Date.now() - startedAt;

		if (!response.ok) {
			let responseBody = "<unavailable>";
			try {
				responseBody = (await response.clone().text()).slice(0, 1200);
			} catch {
				// ignore clone/read issues
			}
			console.error(`[auth][${requestId}] ${req.method} ${endpoint} failed`, {
				status: response.status,
				elapsedMs,
				originInjected,
				effectiveOrigin,
				responseBody,
			});
		} else {
			const logExtras: Record<string, unknown> = {};
			try {
				const ct = response.headers.get("content-type");
				if (ct) logExtras.responseContentType = ct;
				const cc = response.headers.get("set-cookie");
				if (cc) logExtras.setCookiePresent = true;
			} catch {
				// ignore
			}
			console.info(`[auth][${requestId}] ${req.method} ${endpoint} success`, {
				status: response.status,
				elapsedMs,
				originInjected,
				effectiveOrigin,
				...logExtras,
			});
		}
		return response;
	} catch (error) {
		const elapsedMs = Date.now() - startedAt;
		console.error(`[auth][${requestId}] ${req.method} ${endpoint} exception`, {
			elapsedMs,
			error,
		});
		throw error;
	}
}

export async function GET(req: Request): Promise<Response> {
	return executeWithAuthLogs(req, handlers.GET);
}

export async function POST(req: Request): Promise<Response> {
	return executeWithAuthLogs(req, handlers.POST);
}
