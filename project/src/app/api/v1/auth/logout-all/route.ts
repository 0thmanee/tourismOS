import { revokeAllSessionsForCurrentUser } from "~/app/api/v1/_lib/auth";
import {
	jsonV1Error,
	jsonV1Ok,
	v1OptionsResponse,
} from "~/app/api/v1/_lib/http";
import {
	v1AuthRequestHints,
	v1AuthRequestId,
} from "~/app/api/v1/_lib/v1-auth-log";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function POST(request: Request) {
	const requestId = v1AuthRequestId();
	const hints = v1AuthRequestHints(request);
	try {
		console.info(`[v1-auth][${requestId}] POST /auth/logout-all start`, hints);
		const result = await revokeAllSessionsForCurrentUser(request);
		console.info(`[v1-auth][${requestId}] POST /auth/logout-all result`, {
			result,
		});
		if (result === "NO_SESSION") {
			return jsonV1Error(
				request,
				401,
				"UNAUTHORIZED",
				"Authentication required",
			);
		}
		return jsonV1Ok(request, { success: true, scope: "all" });
	} catch (error) {
		console.error(`[v1-auth][${requestId}] POST /auth/logout-all error`, {
			...hints,
			error,
		});
		return jsonV1Error(request, 500, "INTERNAL_ERROR", "Logout-all failed");
	}
}
