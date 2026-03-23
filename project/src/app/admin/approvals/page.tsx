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
        <h1 className="font-serif text-xl font-bold text-(--text-1)">Pending Partner Approvals</h1>
        <p className="font-sans text-sm text-(--text-2) mt-1">
          Approving a partner creates their organization membership and enables access.
        </p>
      </div>

      <div className="card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/70 border-b border-white/60">
            <tr className="text-left">
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-[0.1em] text-(--text-2)">Name</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-[0.1em] text-(--text-2)">Email</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-[0.1em] text-(--text-2)">Profile</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-[0.1em] text-(--text-2)">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  No pending users. Everything is approved.
                </td>
              </tr>
            )}
            {pendingUsers.map((user) => (
              <tr key={user.id} className="border-b border-white/40 last:border-b-0">
                <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{user.name || "Unnamed partner"}</td>
                <td className="px-4 py-3 font-sans text-sm text-(--text-1)">{user.email}</td>
                <td className="px-4 py-3 font-sans text-sm text-(--text-2)">
                  {user.profileCompleted ? "Completed" : "Incomplete"}
                </td>
                <td className="px-4 py-3">
                  <form action={approveAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-(--brand-primary) text-white hover:opacity-90"
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
