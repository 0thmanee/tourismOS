import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deletePartner, getPartner, updatePartner } from "~/app/api/partners/actions";

type Props = {
  params: Promise<{ partnerId: string }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-MA", { dateStyle: "medium" }).format(value);
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
        <h1 className="font-serif text-xl font-bold text-(--text-1)">{partner.name}</h1>
        <p className="font-sans text-sm text-(--text-2) mt-1">
          Joined {formatDate(partner.createdAt)} - {partner.email}
        </p>
      </div>

      <form action={updateAction} className="card rounded-xl p-5 flex flex-col gap-4">
        <h2 className="font-serif text-lg font-bold text-(--text-1)">Account Settings</h2>
        <input type="hidden" name="partnerId" value={partner.id} />
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Name</span>
          <input
            type="text"
            name="name"
            defaultValue={partner.name}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Email</span>
          <input
            type="email"
            name="email"
            defaultValue={partner.email}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-sans text-xs text-(--text-2)">Status</span>
          <select
            name="status"
            defaultValue={partner.status}
            className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </label>
        <button className="self-start rounded-lg px-3 py-2 text-xs font-semibold bg-(--brand-primary) text-white">
          Save Changes
        </button>
      </form>

      <div className="card rounded-xl p-5 flex flex-col gap-2">
        <h2 className="font-serif text-lg font-bold text-(--text-1)">Profile Snapshot</h2>
        <p className="font-sans text-sm text-(--text-2)">
          Entity: {partner.profile?.entityName || "Not provided"} - Region: {partner.profile?.region || "N/A"}
        </p>
        <p className="font-sans text-sm text-(--text-2)">
          Contact: {partner.profile?.firstName || "-"} {partner.profile?.lastName || "-"} -{" "}
          {partner.profile?.phone || "N/A"}
        </p>
      </div>

      <form action={deleteAction} className="card rounded-xl p-5">
        <input type="hidden" name="partnerId" value={partner.id} />
        <button className="rounded-lg px-3 py-2 text-xs font-semibold bg-(--danger) text-white">
          Delete Partner
        </button>
      </form>
    </section>
  );
}
