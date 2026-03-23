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
      <header className="border-b border-white/40 bg-(--surface-card)">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-(--text-1)">Admin Console</span>
            <span className="font-sans text-xs text-(--text-2)">
              Partner approvals and operator management
            </span>
          </div>
          <Link
            href="/producer"
            className="font-sans text-sm font-semibold text-(--text-1) hover:opacity-80"
          >
            Open Producer App
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-5">
        <nav className="flex items-center gap-2">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-sans font-medium text-(--text-1) bg-white/70 hover:bg-white transition-colors border border-white/60"
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
