import Link from "next/link";
import { listPartnersPaginated, listPendingUsers } from "~/app/api/partners/actions";

export default async function AdminOverviewPage() {
  const [pendingUsers, partnersPage] = await Promise.all([
    listPendingUsers(),
    listPartnersPaginated({ page: 1, pageSize: 5 }),
  ]);

  const enabledPartners = partnersPage.items.filter((partner) => partner.status === "enabled").length;

  return (
    <section className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card rounded-xl p-4">
          <p className="font-sans text-xs uppercase tracking-[0.12em] text-(--text-2)">Pending approvals</p>
          <p className="font-serif text-3xl font-bold text-(--text-1) mt-1">{pendingUsers.length}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="font-sans text-xs uppercase tracking-[0.12em] text-(--text-2)">Active partners</p>
          <p className="font-serif text-3xl font-bold text-(--text-1) mt-1">{enabledPartners}</p>
        </div>
        <div className="card rounded-xl p-4">
          <p className="font-sans text-xs uppercase tracking-[0.12em] text-(--text-2)">Partners (sample)</p>
          <p className="font-serif text-3xl font-bold text-(--text-1) mt-1">{partnersPage.total}</p>
        </div>
      </div>

      <div className="card rounded-xl p-5 flex flex-col gap-3">
        <h2 className="font-serif text-xl font-bold text-(--text-1)">MVP Admin Routes</h2>
        <p className="font-sans text-sm text-(--text-2)">
          Start your daily workflow from approvals, then review active partner accounts.
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/approvals"
            className="rounded-lg px-3 py-2 text-sm font-semibold bg-(--brand-primary) text-white hover:opacity-90"
          >
            Review approvals
          </Link>
          <Link
            href="/admin/partners"
            className="rounded-lg px-3 py-2 text-sm font-semibold border border-white/60 bg-white/70 text-(--text-1) hover:bg-white"
          >
            Open partners list
          </Link>
        </div>
      </div>
    </section>
  );
}
