import Link from "next/link";
import { listPartnersPaginated } from "~/app/api/partners/actions";

export default async function AdminPartnersPage() {
	const partnersPage = await listPartnersPaginated({ page: 1, pageSize: 25 });

	return (
		<section className="flex flex-col gap-4">
			<div className="card rounded-xl p-5">
				<h1 className="font-bold font-serif text-(--text-1) text-xl">
					Partners
				</h1>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Active and pending operator accounts for MVP onboarding and
					monitoring.
				</p>
			</div>

			<div className="card overflow-hidden rounded-xl">
				<table className="w-full">
					<thead className="border-white/60 border-b bg-white/70">
						<tr className="text-left">
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Partner
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Entity
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Status
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-widest">
								Profile
							</th>
						</tr>
					</thead>
					<tbody>
						{partnersPage.items.length === 0 && (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={4}
								>
									No partners found.
								</td>
							</tr>
						)}
						{partnersPage.items.map((partner) => (
							<tr
								className="border-white/40 border-b last:border-b-0"
								key={partner.id}
							>
								<td className="px-4 py-3">
									<div className="flex flex-col">
										<Link
											className="font-medium font-sans text-(--text-1) text-sm hover:underline"
											href={`/admin/partners/${partner.id}`}
										>
											{partner.name}
										</Link>
										<span className="font-sans text-(--text-2) text-xs">
											{partner.email}
										</span>
									</div>
								</td>
								<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
									{partner.profile?.entityName || "Not provided"}
								</td>
								<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
									{partner.status === "enabled" ? "Enabled" : "Disabled"}
								</td>
								<td className="px-4 py-3 font-sans text-(--text-2) text-sm">
									{partner.profileCompleted ? "Completed" : "Incomplete"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
