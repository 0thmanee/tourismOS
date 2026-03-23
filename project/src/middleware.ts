import { type NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/producer", "/admin"];
const PENDING_APPROVAL_PATH = "/pending-approval";
const ONBOARDING_PATH = "/onboarding";
const AUTH_PAGES = ["/auth/login", "/auth/register"];

type SessionUser = {
	id: string;
	name: string;
	email: string;
	role?: string;
	status?: string;
	profileCompleted?: boolean;
};

async function getSession(
	request: NextRequest,
): Promise<{ user: SessionUser } | null> {
	try {
		const url = request.nextUrl.origin + "/api/auth/get-session";
		const res = await fetch(url, {
			headers: { cookie: request.headers.get("cookie") ?? "" },
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data?.user ? { user: data.user } : null;
	} catch {
		return null;
	}
}

function redirectToLogin(request: NextRequest, pathname: string) {
	const login = new URL("/auth/login", request.url);
	login.searchParams.set("callbackUrl", pathname);
	return NextResponse.redirect(login);
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	const session = await getSession(request);
	const user = session?.user as SessionUser | undefined;
	const role = user?.role ?? "partner";
	const status = user?.status ?? "disabled";
	const isSuperadmin = role === "superadmin";
	const isPartnerEnabled = role === "partner" && status === "enabled";
	const canAccessProducer = isPartnerEnabled; // only partners (enabled), not superadmin
	const canAccessAdmin = isSuperadmin; // only superadmin

	// Pending approval: require auth; only partners with status disabled should stay here
	if (pathname.startsWith(PENDING_APPROVAL_PATH)) {
		if (!user) return redirectToLogin(request, pathname);
		if (!user.profileCompleted) {
			return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
		}
		if (isSuperadmin)
			return NextResponse.redirect(new URL("/admin", request.url));
		if (isPartnerEnabled)
			return NextResponse.redirect(new URL("/producer", request.url));
		return NextResponse.next();
	}

	// Onboarding: require auth, allow access only when not yet completed
	if (pathname.startsWith(ONBOARDING_PATH)) {
		if (!user) return redirectToLogin(request, pathname);
		if (user.profileCompleted) {
			const target = isSuperadmin
				? "/admin"
				: isPartnerEnabled
					? "/producer"
					: PENDING_APPROVAL_PATH;
			return NextResponse.redirect(new URL(target, request.url));
		}
		return NextResponse.next();
	}

	// /producer: only partner (enabled). Superadmin is redirected to /admin.
	if (pathname.startsWith("/producer")) {
		if (!user) return redirectToLogin(request, pathname);
		if (!user.profileCompleted) {
			return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
		}
		if (isSuperadmin)
			return NextResponse.redirect(new URL("/admin", request.url));
		if (!isPartnerEnabled)
			return NextResponse.redirect(new URL(PENDING_APPROVAL_PATH, request.url));
		return NextResponse.next();
	}

	// /admin: only superadmin. Partner is redirected to /producer or pending-approval.
	if (pathname.startsWith("/admin")) {
		if (!user) return redirectToLogin(request, pathname);
		if (!user.profileCompleted) {
			return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
		}
		if (!canAccessAdmin) {
			return NextResponse.redirect(
				new URL(
					isPartnerEnabled ? "/producer" : PENDING_APPROVAL_PATH,
					request.url,
				),
			);
		}
		return NextResponse.next();
	}

	// Auth pages: redirect to dashboard, onboarding, or pending-approval if already logged in
	if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
		if (user) {
			if (!user.profileCompleted) {
				return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
			}
			const target = isSuperadmin
				? "/admin"
				: isPartnerEnabled
					? "/producer"
					: PENDING_APPROVAL_PATH;
			return NextResponse.redirect(new URL(target, request.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/producer/:path*",
		"/admin/:path*",
		"/pending-approval",
		"/pending-approval/:path*",
		"/onboarding",
		"/onboarding/:path*",
		"/auth/login",
		"/auth/register",
	],
};
