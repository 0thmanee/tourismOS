import Link from "next/link";
import { listPartnersPaginated } from "~/app/api/partners/actions";

export default async function AdminPartnersPage() {
  const partnersPage = await listPartnersPaginated({ page: 1, pageSize: 25 });

  return (
    <section className="flex flex-col gap-4">
      <div className="card rounded-xl p-5">
        <h1 className="font-serif text-xl font-bold text-(--text-1)">Partners</h1>
        <p className="font-sans text-sm text-(--text-2) mt-1">
          Active and pending operator accounts for MVP onboarding and monitoring.
        </p>
      </div>

      <div className="card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/70 border-b border-white/60">
            <tr className="text-left">
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Partner</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Entity</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Status</th>
              <th className="px-4 py-3 font-sans text-xs uppercase tracking-widest text-(--text-2)">Profile</th>
            </tr>
          </thead>
          <tbody>
            {partnersPage.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-sans text-sm text-(--text-2)">
                  No partners found.
                </td>
              </tr>
            )}
            {partnersPage.items.map((partner) => (
              <tr key={partner.id} className="border-b border-white/40 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="font-sans text-sm font-medium text-(--text-1) hover:underline"
                    >
                      {partner.name}
                    </Link>
                    <span className="font-sans text-xs text-(--text-2)">{partner.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-(--text-1)">
                  {partner.profile?.entityName || "Not provided"}
                </td>
                <td className="px-4 py-3 font-sans text-sm text-(--text-1)">
                  {partner.status === "enabled" ? "Enabled" : "Disabled"}
                </td>
                <td className="px-4 py-3 font-sans text-sm text-(--text-2)">
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
