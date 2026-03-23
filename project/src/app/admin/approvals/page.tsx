import { revalidatePath } from "next/cache";
import { approveUser, listPendingUsers } from "~/app/api/partners/actions";

export default async function AdminApprovalsPage() {
	const pendingUsers = await listPendingUsers();

	async function approveAction(formData: FormData) {
		"use server";

		const userId = formData.get("userId");
		if (typeof userId !== "string" || userId.length === 0) return;

		await approveUser(userId);
		revalidatePath("/admin");
		revalidatePath("/admin/approvals");
		revalidatePath("/admin/partners");
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="card rounded-xl p-5">
				<h1 className="font-bold font-serif text-(--text-1) text-xl">
					Pending Partner Approvals
				</h1>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Approving a partner creates their organization membership and enables
					access.
				</p>
			</div>

			<div className="card overflow-hidden rounded-xl">
				<table className="w-full">
					<thead className="border-white/60 border-b bg-white/70">
						<tr className="text-left">
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-[0.1em]">
								Name
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-[0.1em]">
								Email
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-[0.1em]">
								Profile
							</th>
							<th className="px-4 py-3 font-sans text-(--text-2) text-xs uppercase tracking-[0.1em]">
								Action
							</th>
						</tr>
					</thead>
					<tbody>
						{pendingUsers.length === 0 && (
							<tr>
								<td
									className="px-4 py-8 text-center font-sans text-(--text-2) text-sm"
									colSpan={4}
								>
									No pending users. Everything is approved.
								</td>
							</tr>
						)}
						{pendingUsers.map((user) => (
							<tr
								className="border-white/40 border-b last:border-b-0"
								key={user.id}
							>
								<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
									{user.name || "Unnamed partner"}
								</td>
								<td className="px-4 py-3 font-sans text-(--text-1) text-sm">
									{user.email}
								</td>
								<td className="px-4 py-3 font-sans text-(--text-2) text-sm">
									{user.profileCompleted ? "Completed" : "Incomplete"}
								</td>
								<td className="px-4 py-3">
									<form action={approveAction}>
										<input name="userId" type="hidden" value={user.id} />
										<button
											className="rounded-lg bg-(--brand-primary) px-3 py-1.5 font-semibold text-white text-xs hover:opacity-90"
											type="submit"
										>
											Approve
										</button>
									</form>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}
