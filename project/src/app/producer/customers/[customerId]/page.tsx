import { notFound } from "next/navigation";
import { getMyCustomerDetail } from "~/app/api/customers/actions";
import { CustomerDetailView } from "~/features/producer/components/customers/customer-detail-view";

type Props = {
	params: Promise<{ customerId: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
	const { customerId } = await params;
	const customer = await getMyCustomerDetail(customerId);
	if (!customer) notFound();

	return <CustomerDetailView customer={customer} />;
}
