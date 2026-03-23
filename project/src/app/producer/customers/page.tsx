import Link from "next/link";
import { listMyCustomers } from "~/app/api/customers/actions";

export default async function CustomersPage() {
  const customers = await listMyCustomers();

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-4 max-w-3xl">
      <div>
        <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Customers</h2>
        <p className="font-sans text-sm text-(--text-2) mt-1">Simple CRM — bookings count and lifetime value per client.</p>
      </div>

      <div className="flex flex-col gap-2">
        {customers.length === 0 ? (
          <div className="rounded-xl card p-8 text-center font-sans text-sm text-(--text-2)">
            No customers yet. They appear when you create bookings.
          </div>
        ) : (
          customers.map((c) => (
            <Link
              key={c.id}
              href={`/producer/customers/${c.id}`}
              className="rounded-xl card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:opacity-95 transition-opacity"
            >
              <div>
                <p className="font-serif font-bold text-[16px] text-(--text-1)">{c.name}</p>
                <p className="font-sans text-xs text-(--text-2)">{c.phone}</p>
              </div>
              <div className="flex items-center gap-6 font-sans text-sm text-(--text-1)">
                <span>
                  <span className="text-(--text-2) text-xs block">Bookings</span>
                  {c.bookingCount}
                </span>
                <span>
                  <span className="text-(--text-2) text-xs block">Total</span>
                  {c.totalPriceMad.toLocaleString("en-MA")} MAD
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
