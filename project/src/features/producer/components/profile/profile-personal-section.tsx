import React from "react";

type Props = {
	fullName: string;
	email: string;
	phone: string;
};

export function ProfilePersonalSection({ fullName, email, phone }: Props) {
	const fields = [
		{ label: "Full Name", value: fullName },
		{ label: "Email Address", value: email },
		{ label: "Phone Number", value: phone },
		{ label: "Preferred Language", value: "French / Arabic" },
	];

	return (
		<div className="card overflow-hidden rounded-xl">
			<div className="border-(--app-border) border-b px-5 py-4">
				<h3 className="font-bold font-serif text-(--text-1) text-[15px]">
					Personal Information
				</h3>
				<p className="mt-0.5 font-sans text-(--text-2) text-[11px]">
					Your account and contact details
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
				{fields.map((field) => (
					<div className="flex flex-col gap-1.5" key={field.label}>
						<label className="font-bold font-sans text-(--text-2) text-[10px] uppercase tracking-[0.12em]">
							{field.label}
						</label>
						<div className="field rounded-xl px-3.5 py-2.5 font-sans text-sm">
							{field.value || "—"}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
