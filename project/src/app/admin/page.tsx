import Link from "next/link";
import {
	listPartnersPaginated,
	listPendingUsers,
} from "~/app/api/partners/actions";

export default async function AdminOverviewPage() {
	const [pendingUsers, partnersPage] = await Promise.all([
		listPendingUsers(),
		listPartnersPaginated({ page: 1, pageSize: 5 }),
	]);

	const enabledPartners = partnersPage.items.filter(
		(partner) => partner.status === "enabled",
	).length;

	return (
		<section className="flex flex-col gap-4">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="card rounded-xl p-4">
					<p className="font-sans text-(--text-2) text-xs uppercase tracking-[0.12em]">
						Pending approvals
					</p>
					<p className="mt-1 font-bold font-serif text-(--text-1) text-3xl">
						{pendingUsers.length}
					</p>
				</div>
				<div className="card rounded-xl p-4">
					<p className="font-sans text-(--text-2) text-xs uppercase tracking-[0.12em]">
						Active partners
					</p>
					<p className="mt-1 font-bold font-serif text-(--text-1) text-3xl">
						{enabledPartners}
					</p>
				</div>
				<div className="card rounded-xl p-4">
					<p className="font-sans text-(--text-2) text-xs uppercase tracking-[0.12em]">
						Partners (sample)
					</p>
					<p className="mt-1 font-bold font-serif text-(--text-1) text-3xl">
						{partnersPage.total}
					</p>
				</div>
			</div>

			<div className="card flex flex-col gap-3 rounded-xl p-5">
				<h2 className="font-bold font-serif text-(--text-1) text-xl">
					MVP Admin Routes
				</h2>
				<p className="font-sans text-(--text-2) text-sm">
					Start your daily workflow from approvals, then review active partner
					accounts.
				</p>
				<div className="flex items-center gap-2">
					<Link
						className="rounded-lg bg-(--brand-primary) px-3 py-2 font-semibold text-sm text-white hover:opacity-90"
						href="/admin/approvals"
					>
						Review approvals
					</Link>
					<Link
						className="rounded-lg border border-white/60 bg-white/70 px-3 py-2 font-semibold text-(--text-1) text-sm hover:bg-white"
						href="/admin/partners"
					>
						Open partners list
					</Link>
				</div>
			</div>
		</section>
	);
}
