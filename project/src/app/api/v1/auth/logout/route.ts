import { getV1AuthSession } from "~/app/api/v1/_lib/auth";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import {
	v1AuthRequestHints,
	v1AuthRequestId,
} from "~/app/api/v1/_lib/v1-auth-log";
import { auth } from "~/lib/auth";
import { prisma } from "~/lib/db";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function POST(request: Request) {
	const requestId = v1AuthRequestId();
	const hints = v1AuthRequestHints(request);
	try {
		// Transport-agnostic logout:
		// - Cookie sessions: Better Auth signOut()
		// - Bearer sessions (native): delete the current session row by token
		const authHeader = request.headers.get("authorization");
		const bearerToken = authHeader?.startsWith("Bearer ")
			? authHeader.slice("Bearer ".length).trim()
			: null;

		console.info(`[v1-auth][${requestId}] POST /auth/logout start`, {
			...hints,
			bearerLen: bearerToken?.length ?? 0,
		});

		if (bearerToken) {
			const deleted = await prisma.session.deleteMany({
				where: { token: bearerToken },
			});
			console.info(`[v1-auth][${requestId}] POST /auth/logout bearer rows`, {
				deletedCount: deleted.count,
			});
		}

		// If cookies are present (web), this revokes that session too.
		await auth.api.signOut({ headers: request.headers });

		// Optional: if neither bearer nor cookie session exists, remain idempotent (still success).
		// We intentionally do not return 401 here.
		const still = await getV1AuthSession(request);
		console.info(`[v1-auth][${requestId}] POST /auth/logout after signOut`, {
			sessionStillResolves: Boolean(still),
		});
		return jsonV1Ok(request, { success: true });
	} catch (error) {
		console.error(`[v1-auth][${requestId}] POST /auth/logout error`, {
			...hints,
			error,
		});
		return jsonV1Error(request, 500, "INTERNAL_ERROR", "Logout failed");
	}
}
