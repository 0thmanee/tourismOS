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
    <div className="p-4 lg:p-6 flex flex-col gap-4">
      <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Team</h2>
      <div className="rounded-xl p-6 lg:p-8 card flex flex-col gap-4">
        <p className="font-sans text-sm text-(--text-2)">
          Manage guide and driver assignments for each booking from one place.
        </p>

        <form action={createStaffAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Name</span>
            <input
              type="text"
              name="name"
              placeholder="Team member"
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Role</span>
            <select name="role" className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm">
              <option value="GUIDE">Guide</option>
              <option value="DRIVER">Driver</option>
              <option value="COORDINATOR">Coordinator</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-sans text-xs text-(--text-2)">Phone</span>
            <input
              type="tel"
              name="phone"
              placeholder="+212..."
              className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
            />
          </label>
          <button
            type="submit"
            className="h-10 rounded-lg px-3 text-xs font-semibold bg-(--brand-primary) text-white"
          >
            Add member
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {staffMembers.length === 0 && (
            <div className="rounded-xl border border-white/50 bg-white/40 px-4 py-8 text-center font-sans text-sm text-(--text-2)">
              No staff members yet. Add your first guide or driver above.
            </div>
          )}
          {staffMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-xl border border-white/50 bg-white/40 p-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between"
            >
              <form action={updateStaffAction} className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
                <input type="hidden" name="id" value={member.id} />
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-xs text-(--text-2)">Name</span>
                  <input
                    type="text"
                    name="name"
                    defaultValue={member.name}
                    className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-xs text-(--text-2)">Role</span>
                  <select
                    name="role"
                    defaultValue={member.role}
                    className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
                  >
                    <option value="GUIDE">Guide</option>
                    <option value="DRIVER">Driver</option>
                    <option value="COORDINATOR">Coordinator</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-sans text-xs text-(--text-2)">Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={member.phone ?? ""}
                    className="h-9 rounded-lg border border-white/70 bg-white/80 px-2 text-xs"
                  />
                </label>
                <label className="flex items-center gap-2 pt-6">
                  <input type="checkbox" name="isActive" defaultChecked={member.isActive} />
                  <span className="font-sans text-xs text-(--text-2)">Active</span>
                </label>
                <div className="md:col-span-4 flex items-center gap-2">
                  <button className="h-8 rounded-lg px-2 text-[11px] font-semibold bg-white border border-white/70">
                    Save
                  </button>
                  <span className="font-sans text-xs text-(--text-2)">
                    {member.isActive ? "Available for assignment" : "Inactive"}
                  </span>
                </div>
              </form>
              <form action={deleteStaffAction}>
                <input type="hidden" name="id" value={member.id} />
                <button className="h-8 rounded-lg px-2 text-[11px] font-semibold bg-(--danger) text-white">
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
