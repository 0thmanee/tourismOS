import React from "react";

type Props = {
	entityName: string;
	registrationNumber: string | null;
	region: string;
	city: string;
	yearEstablished: string | null;
	categories: string[];
	annualCapacity: string | null;
};

export function ProfileBusinessSection({
	entityName,
	registrationNumber,
	region,
	city,
	yearEstablished,
	categories,
	annualCapacity,
}: Props) {
	const primaryProducts = categories.length > 0 ? categories.join(", ") : "—";

	const fields = [
		{ label: "Entity Name", value: entityName },
		{ label: "Registration No.", value: registrationNumber ?? "—" },
		{ label: "Region", value: region },
		{ label: "City", value: city },
		{ label: "Year Established", value: yearEstablished ?? "—" },
		{ label: "Primary Products", value: primaryProducts },
		{ label: "Annual Capacity", value: annualCapacity ?? "—" },
	];

	return (
		<div className="card overflow-hidden rounded-xl">
			<div className="border-(--app-border) border-b px-5 py-4">
				<h3 className="font-bold font-serif text-(--text-1) text-[15px]">
					Business Information
				</h3>
				<p className="mt-0.5 font-sans text-(--text-2) text-[11px]">
					Your cooperative and legal details
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
				{fields.map((field) => (
					<div className="flex flex-col gap-1.5" key={field.label}>
						<label className="font-bold font-sans text-(--text-2) text-[10px] uppercase tracking-[0.12em]">
							{field.label}
						</label>
						<div className="field rounded-xl px-3.5 py-2.5 font-sans text-sm">
							{field.value}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
