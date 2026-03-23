import { revalidatePath } from "next/cache";
import {
	createStaffMember,
	deleteStaffMember,
	listMyStaffMembers,
	updateStaffMember,
} from "~/app/api/staff/actions";

export default async function StaffPage() {
	const staffMembers = await listMyStaffMembers();

	async function createStaffAction(formData: FormData) {
		"use server";

		const name = formData.get("name");
		const role = formData.get("role");
		const phone = formData.get("phone");
		if (typeof name !== "string" || typeof role !== "string") return;
		if (role !== "GUIDE" && role !== "DRIVER" && role !== "COORDINATOR") return;

		await createStaffMember({
			name: name.trim(),
			role,
			phone: typeof phone === "string" ? phone : null,
		});
		revalidatePath("/producer/staff");
		revalidatePath("/producer/bookings");
	}

	async function updateStaffAction(formData: FormData) {
		"use server";

		const id = formData.get("id");
		const name = formData.get("name");
		const role = formData.get("role");
		const phone = formData.get("phone");
		const isActive = formData.get("isActive");
		if (
			typeof id !== "string" ||
			typeof name !== "string" ||
			typeof role !== "string" ||
			(role !== "GUIDE" && role !== "DRIVER" && role !== "COORDINATOR")
		) {
			return;
		}

		await updateStaffMember({
			id,
			name: name.trim(),
			role,
			phone: typeof phone === "string" ? phone : null,
			isActive: isActive === "on",
		});
		revalidatePath("/producer/staff");
		revalidatePath("/producer/bookings");
	}

	async function deleteStaffAction(formData: FormData) {
		"use server";

		const id = formData.get("id");
		if (typeof id !== "string") return;

		await deleteStaffMember(id);
		revalidatePath("/producer/staff");
		revalidatePath("/producer/bookings");
	}

	return (
		<div className="flex flex-col gap-4 p-4 lg:p-6">
			<h2 className="font-bold font-serif text-(--text-1) text-[18px]">Team</h2>
			<div className="card flex flex-col gap-4 rounded-xl p-6 lg:p-8">
				<p className="font-sans text-(--text-2) text-sm">
					Manage guide and driver assignments for each booking from one place.
				</p>

				<form
					action={createStaffAction}
					className="grid grid-cols-1 items-end gap-2 md:grid-cols-4"
				>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Name</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							name="name"
							placeholder="Team member"
							type="text"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Role</span>
						<select
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							name="role"
						>
							<option value="GUIDE">Guide</option>
							<option value="DRIVER">Driver</option>
							<option value="COORDINATOR">Coordinator</option>
						</select>
					</label>
					<label className="flex flex-col gap-1">
						<span className="font-sans text-(--text-2) text-xs">Phone</span>
						<input
							className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							name="phone"
							placeholder="+212..."
							type="tel"
						/>
					</label>
					<button
						className="h-10 rounded-lg bg-(--brand-primary) px-3 font-semibold text-white text-xs"
						type="submit"
					>
						Add member
					</button>
				</form>

				<div className="flex flex-col gap-2">
					{staffMembers.length === 0 && (
						<div className="rounded-xl border border-white/50 bg-white/40 px-4 py-8 text-center font-sans text-(--text-2) text-sm">
							No staff members yet. Add your first guide or driver above.
						</div>
					)}
					{staffMembers.map((member) => (
						<div
							className="flex flex-col gap-2 rounded-xl border border-white/50 bg-white/40 p-3 lg:flex-row lg:items-end lg:justify-between"
							key={member.id}
						>
							<form
								action={updateStaffAction}
								className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-4"
							>
								<input name="id" type="hidden" value={member.id} />
								<label className="flex flex-col gap-1">
									<span className="font-sans text-(--text-2) text-xs">
										Name
									</span>
									<input
										className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
										defaultValue={member.name}
										name="name"
										type="text"
									/>
								</label>
								<label className="flex flex-col gap-1">
									<span className="font-sans text-(--text-2) text-xs">
										Role
									</span>
									<select
										className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
										defaultValue={member.role}
										name="role"
									>
										<option value="GUIDE">Guide</option>
										<option value="DRIVER">Driver</option>
										<option value="COORDINATOR">Coordinator</option>
									</select>
								</label>
								<label className="flex flex-col gap-1">
									<span className="font-sans text-(--text-2) text-xs">
										Phone
									</span>
									<input
										className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
										defaultValue={member.phone ?? ""}
										name="phone"
										type="tel"
									/>
								</label>
								<label className="flex items-center gap-2 pt-6">
									<input
										defaultChecked={member.isActive}
										name="isActive"
										type="checkbox"
									/>
									<span className="font-sans text-(--text-2) text-xs">
										Active
									</span>
								</label>
								<div className="flex items-center gap-2 md:col-span-4">
									<button className="h-8 rounded-lg border border-white/70 bg-white px-2 font-semibold text-[11px]">
										Save
									</button>
									<span className="font-sans text-(--text-2) text-xs">
										{member.isActive ? "Available for assignment" : "Inactive"}
									</span>
								</div>
							</form>
							<form action={deleteStaffAction}>
								<input name="id" type="hidden" value={member.id} />
								<button className="h-8 rounded-lg bg-(--danger) px-2 font-semibold text-[11px] text-white">
									Delete
								</button>
							</form>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
