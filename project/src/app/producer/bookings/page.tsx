import { BookingsTableView } from "~/features/producer/components/bookings/bookings-table-view";

type Props = {
  searchParams: Promise<{ search?: string }>;
};

export default async function BookingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  return <BookingsTableView initialSearch={sp.search ?? ""} />;
}
