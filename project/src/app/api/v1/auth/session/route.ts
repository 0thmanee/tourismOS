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
		const authenticated = Boolean(data);
		console.info(`[v1-auth][${requestId}] GET /auth/session`, {
			...hints,
			authenticated,
			userId: authenticated ? data?.user.id : null,
		});
		if (!data) {
			return jsonV1Ok(request, {
				authenticated: false,
				session: null,
				user: null,
			});
		}
		return jsonV1Ok(request, {
			authenticated: true,
			session: data.session,
			user: data.user,
		});
	} catch (error) {
		console.error(`[v1-auth][${requestId}] GET /auth/session error`, {
			...hints,
			error,
		});
		return jsonV1Error(
			request,
			500,
			"INTERNAL_ERROR",
			"Failed to read auth session",
		);
	}
}
