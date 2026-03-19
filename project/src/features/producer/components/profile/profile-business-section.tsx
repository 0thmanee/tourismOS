import React from "react";

const fieldStyle = {
  background: "#F5F0E8",
  border: "1px solid #E8EDE9",
};

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
    <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid #E8EDE9" }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: "#E8EDE9" }}>
        <h3 className="font-serif font-bold text-[15px] text-[#1c3a28]">Business Information</h3>
        <p className="font-sans text-[11px] text-[#4a6358] mt-0.5">Your cooperative and legal details</p>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <label className="font-sans text-[10px] font-bold tracking-[0.12em] text-[#4a6358] uppercase">
              {field.label}
            </label>
            <div className="font-sans text-sm text-[#1c3a28] rounded-xl px-3.5 py-2.5" style={fieldStyle}>
              {field.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
