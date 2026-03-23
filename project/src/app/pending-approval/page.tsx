import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "~/app/api/auth/actions";
import { PendingApprovalContent } from "./PendingApprovalContent";

export default async function PendingApprovalPage() {
	const session = await getSession();
	if (!session?.user) {
		redirect(
			"/auth/login?callbackUrl=" + encodeURIComponent("/pending-approval"),
		);
	}

	return (
		<div className="auth-shell flex-col items-center justify-center px-4">
			<div aria-hidden className="auth-pattern bg-moroccan-pattern" />
			<PendingApprovalContent />
		</div>
	);
}
