"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { signOut } from "~/lib/auth-client";

export function PendingApprovalContent() {
	return (
		<div className="relative z-10 flex max-w-md flex-col items-center gap-6 text-center">
			<div className="auth-badge flex h-20 w-20 items-center justify-center rounded-full">
				<Clock aria-hidden size={36} />
			</div>
			<div>
				<h1 className="font-bold font-serif text-[28px] text-white leading-tight">
					Account pending approval
				</h1>
				<p className="mt-3 font-sans text-sm text-white/70 leading-relaxed">
					Your profile has been submitted. A TourismOS admin will review your
					account and enable access to the Operator Portal. You’ll be able to
					sign in and use the portal once approved.
				</p>
			</div>
			<p className="font-sans text-white/50 text-xs">
				This usually takes 1-2 business days. If you have questions, contact
				support.
			</p>
			<div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
				<button
					className="font-sans font-semibold text-gold text-sm transition-colors hover:text-gold/80"
					onClick={() => signOut()}
					type="button"
				>
					Sign out
				</button>
				<Link
					className="font-sans text-sm text-white/50 transition-colors hover:text-white/70"
					href="/"
				>
					Back to homepage
				</Link>
			</div>
		</div>
	);
}
