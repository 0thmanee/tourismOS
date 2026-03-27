import { auth } from "~/lib/auth";
import { prisma } from "~/lib/db";

export type V1AuthSession = {
	session: {
		id: string;
		expiresAt: string;
	};
	user: {
		id: string;
		email: string;
		name: string;
		image: string | null;
		emailVerified: boolean;
	};
};

export async function getV1AuthSession(
	request: Request,
): Promise<V1AuthSession | null> {
	let session = await auth.api.getSession({
		headers: request.headers,
	});

	// Native clients might call v1 endpoints with Bearer token instead of auth cookies.
	if (!session?.session || !session.user) {
		const authHeader = request.headers.get("authorization");
		const token = authHeader?.startsWith("Bearer ")
			? authHeader.slice("Bearer ".length).trim()
			: null;
		if (token) {
			const row = await prisma.session.findUnique({
				where: { token },
				include: { user: true },
			});
			if (!row) {
				console.info("[v1-auth] bearer lookup miss", {
					tokenLen: token.length,
				});
			} else if (row?.user) {
				// Enforce expiry for bearer session transport.
				if (row.expiresAt.getTime() <= Date.now()) {
					console.info("[v1-auth] bearer session expired", {
						sessionId: row.id,
						expiresAt: row.expiresAt.toISOString(),
					});
					return null;
				}
				console.info("[v1-auth] session resolved via bearer", {
					sessionId: row.id,
					userId: row.user.id,
				});
				session = {
					session: {
						id: row.id,
						expiresAt: row.expiresAt,
					},
					user: {
						id: row.user.id,
						email: row.user.email,
						name: row.user.name,
						image: row.user.image,
						emailVerified: row.user.emailVerified,
					},
				} as Awaited<ReturnType<typeof auth.api.getSession>>;
			}
		}
	}

	if (!session?.session || !session.user) return null;

	return {
		session: {
			id: session.session.id,
			expiresAt: session.session.expiresAt.toISOString(),
		},
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			image: session.user.image ?? null,
			emailVerified: Boolean(session.user.emailVerified),
		},
	};
}

export async function revokeAllSessionsForCurrentUser(
	request: Request,
): Promise<"NO_SESSION" | "OK"> {
	const resolved = await getV1AuthSession(request);
	if (!resolved?.user?.id) return "NO_SESSION";

	await prisma.session.deleteMany({
		where: { userId: resolved.user.id },
	});
	return "OK";
}
