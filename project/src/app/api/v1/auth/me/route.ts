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

export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
	return v1OptionsResponse(request);
}

export async function GET(request: Request) {
	const requestId = v1AuthRequestId();
	const hints = v1AuthRequestHints(request);
	try {
		const data = await getV1AuthSession(request);
		const ok = Boolean(data);
		console.info(`[v1-auth][${requestId}] GET /auth/me`, {
			...hints,
			ok,
			userId: ok ? data?.user.id : null,
		});
		if (!data) {
			return jsonV1Error(
				request,
				401,
				"UNAUTHORIZED",
				"Authentication required",
			);
		}
		return jsonV1Ok(request, { user: data.user });
	} catch (error) {
		console.error(`[v1-auth][${requestId}] GET /auth/me error`, {
			...hints,
			error,
		});
		return jsonV1Error(request, 500, "INTERNAL_ERROR", "Failed to read user");
	}
}
