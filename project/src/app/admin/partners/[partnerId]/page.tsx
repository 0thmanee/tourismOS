import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
	deletePartner,
	getPartner,
	updatePartner,
} from "~/app/api/partners/actions";

type Props = {
	params: Promise<{ partnerId: string }>;
};

function formatDate(value: Date) {
	return new Intl.DateTimeFormat("en-MA", { dateStyle: "medium" }).format(
		value,
	);
}

export default async function AdminPartnerDetailPage({ params }: Props) {
	const { partnerId } = await params;
	const partner = await getPartner(partnerId);

	if (!partner) {
		redirect("/admin/partners");
	}

	async function updateAction(formData: FormData) {
		"use server";

		const id = formData.get("partnerId");
		const name = formData.get("name");
		const email = formData.get("email");
		const status = formData.get("status");
		if (
			typeof id !== "string" ||
			typeof name !== "string" ||
			typeof email !== "string" ||
			(status !== "enabled" && status !== "disabled")
		) {
			return;
		}

		await updatePartner(id, { name, email, status });
		revalidatePath("/admin");
		revalidatePath("/admin/partners");
		revalidatePath(`/admin/partners/${id}`);
	}

	async function deleteAction(formData: FormData) {
		"use server";

		const id = formData.get("partnerId");
		if (typeof id !== "string") return;

		await deletePartner(id);
		revalidatePath("/admin");
		revalidatePath("/admin/partners");
		redirect("/admin/partners");
	}

	return (
		<section className="flex flex-col gap-4">
			<div className="card rounded-xl p-5">
				<h1 className="font-bold font-serif text-(--text-1) text-xl">
					{partner.name}
				</h1>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Joined {formatDate(partner.createdAt)} - {partner.email}
				</p>
			</div>

			<form
				action={updateAction}
				className="card flex flex-col gap-4 rounded-xl p-5"
			>
				<h2 className="font-bold font-serif text-(--text-1) text-lg">
					Account Settings
				</h2>
				<input name="partnerId" type="hidden" value={partner.id} />
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Name</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						defaultValue={partner.name}
						name="name"
						type="text"
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Email</span>
					<input
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						defaultValue={partner.email}
						name="email"
						type="email"
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="font-sans text-(--text-2) text-xs">Status</span>
					<select
						className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
						defaultValue={partner.status}
						name="status"
					>
						<option value="enabled">Enabled</option>
						<option value="disabled">Disabled</option>
					</select>
				</label>
				<button className="self-start rounded-lg bg-(--brand-primary) px-3 py-2 font-semibold text-white text-xs">
					Save Changes
				</button>
			</form>

			<div className="card flex flex-col gap-2 rounded-xl p-5">
				<h2 className="font-bold font-serif text-(--text-1) text-lg">
					Profile Snapshot
				</h2>
				<p className="font-sans text-(--text-2) text-sm">
					Entity: {partner.profile?.entityName || "Not provided"} - Region:{" "}
					{partner.profile?.region || "N/A"}
				</p>
				<p className="font-sans text-(--text-2) text-sm">
					Contact: {partner.profile?.firstName || "-"}{" "}
					{partner.profile?.lastName || "-"} - {partner.profile?.phone || "N/A"}
				</p>
			</div>

			<form action={deleteAction} className="card rounded-xl p-5">
				<input name="partnerId" type="hidden" value={partner.id} />
				<button className="rounded-lg bg-(--danger) px-3 py-2 font-semibold text-white text-xs">
					Delete Partner
				</button>
			</form>
		</section>
	);
}
