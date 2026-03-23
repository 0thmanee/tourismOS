import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";

const ADMIN_NAV_ITEMS = [
	{ href: "/admin", label: "Overview" },
	{ href: "/admin/approvals", label: "Approvals" },
	{ href: "/admin/partners", label: "Partners" },
];

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session?.user) {
		redirect("/auth/login?callbackUrl=" + encodeURIComponent("/admin"));
	}

	if ((session.user as { role?: string }).role !== "superadmin") {
		redirect("/producer");
	}

	return (
		<div className="min-h-screen bg-(--surface-page)">
			<header className="border-white/40 border-b bg-(--surface-card)">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
					<div className="flex flex-col">
						<span className="font-bold font-serif text-(--text-1) text-lg">
							Admin Console
						</span>
						<span className="font-sans text-(--text-2) text-xs">
							Partner approvals and operator management
						</span>
					</div>
					<Link
						className="font-sans font-semibold text-(--text-1) text-sm hover:opacity-80"
						href="/producer"
					>
						Open Producer App
					</Link>
				</div>
			</header>

			<div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 lg:px-6">
				<nav className="flex items-center gap-2">
					{ADMIN_NAV_ITEMS.map((item) => (
						<Link
							className="rounded-lg border border-white/60 bg-white/70 px-3 py-2 font-medium font-sans text-(--text-1) text-sm transition-colors hover:bg-white"
							href={item.href}
							key={item.href}
						>
							{item.label}
						</Link>
					))}
				</nav>
				{children}
			</div>
		</div>
	);
}
