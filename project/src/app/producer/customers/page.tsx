import Link from "next/link";
import { listMyCustomers } from "~/app/api/customers/actions";

export default async function CustomersPage() {
	const customers = await listMyCustomers();

	return (
		<div className="flex max-w-3xl flex-col gap-4 p-4 lg:p-6">
			<div>
				<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
					Customers
				</h2>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Simple CRM — bookings count and lifetime value per client.
				</p>
			</div>

			<div className="flex flex-col gap-2">
				{customers.length === 0 ? (
					<div className="card rounded-xl p-8 text-center font-sans text-(--text-2) text-sm">
						No customers yet. They appear when you create bookings.
					</div>
				) : (
					customers.map((c) => (
						<Link
							className="card flex flex-col gap-2 rounded-xl p-4 transition-opacity hover:opacity-95 sm:flex-row sm:items-center sm:justify-between"
							href={`/producer/customers/${c.id}`}
							key={c.id}
						>
							<div>
								<p className="font-bold font-serif text-(--text-1) text-[16px]">
									{c.name}
								</p>
								<p className="font-sans text-(--text-2) text-xs">{c.phone}</p>
							</div>
							<div className="flex items-center gap-6 font-sans text-(--text-1) text-sm">
								<span>
									<span className="block text-(--text-2) text-xs">
										Bookings
									</span>
									{c.bookingCount}
								</span>
								<span>
									<span className="block text-(--text-2) text-xs">Total</span>
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
