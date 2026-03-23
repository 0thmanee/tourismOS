"use client";

import type React from "react";
import { useMemo, useState, useTransition } from "react";
import type { OrganizationSettingsRow } from "~/app/api/organization-settings";
import { updateMyOrganizationSettings } from "~/app/api/organization-settings/actions";

type Props = {
	initial: OrganizationSettingsRow;
};

export function OperatorSettingsForm({ initial }: Props) {
	const [businessName, setBusinessName] = useState(initial.businessName ?? "");
	const [activities, setActivities] = useState<string[]>(
		initial.activities.length ? initial.activities : [""],
	);
	const [presets, setPresets] = useState<{ label: string; priceMad: string }[]>(
		initial.pricingPresets.length
			? initial.pricingPresets.map((p) => ({
					label: p.label,
					priceMad: String(p.priceMad),
				}))
			: [{ label: "", priceMad: "" }],
	);
	const [message, setMessage] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const canSubmit = useMemo(() => {
		return true;
	}, []);

	function addActivity() {
		setActivities((a) => [...a, ""]);
	}

	function removeActivity(i: number) {
		setActivities((a) => a.filter((_, idx) => idx !== i));
	}

	function addPreset() {
		setPresets((p) => [...p, { label: "", priceMad: "" }]);
	}

	function removePreset(i: number) {
		setPresets((p) => p.filter((_, idx) => idx !== i));
	}

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setMessage(null);
		startTransition(async () => {
			try {
				await updateMyOrganizationSettings({
					businessName: businessName.trim() || null,
					activities: activities.map((a) => a.trim()).filter(Boolean),
					pricingPresets: presets
						.map((p) => ({
							label: p.label.trim(),
							priceMad: Number(p.priceMad),
						}))
						.filter(
							(p) => p.label && Number.isFinite(p.priceMad) && p.priceMad >= 0,
						),
				});
				setMessage("Saved.");
			} catch {
				setMessage("Could not save settings.");
			}
		});
	}

	return (
		<form
			className="flex max-w-2xl flex-col gap-6 p-4 lg:p-6"
			onSubmit={onSubmit}
		>
			<div>
				<h2 className="font-bold font-serif text-(--text-1) text-[18px]">
					Settings
				</h2>
				<p className="mt-1 font-sans text-(--text-2) text-sm">
					Business name, activity labels, and pricing presets for quick booking.
				</p>
			</div>

			<label className="flex flex-col gap-1">
				<span className="font-sans font-semibold text-(--text-2) text-xs">
					Business display name
				</span>
				<input
					className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
					onChange={(e) => setBusinessName(e.target.value)}
					placeholder="Shown in quick-add hints"
					value={businessName}
				/>
			</label>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span className="font-sans font-semibold text-(--text-2) text-xs">
						Activities list
					</span>
					<button
						className="font-semibold text-(--brand-primary) text-xs"
						onClick={addActivity}
						type="button"
					>
						+ Add
					</button>
				</div>
				{activities.map((a, i) => (
					<div className="flex gap-2" key={`a-${i}`}>
						<input
							className="h-10 flex-1 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) =>
								setActivities((prev) =>
									prev.map((x, idx) => (idx === i ? e.target.value : x)),
								)
							}
							placeholder="Desert tour, Cooking class…"
							value={a}
						/>
						<button
							className="px-2 text-(--text-2) text-xs"
							onClick={() => removeActivity(i)}
							type="button"
						>
							✕
						</button>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<span className="font-sans font-semibold text-(--text-2) text-xs">
						Pricing presets (MAD)
					</span>
					<button
						className="font-semibold text-(--brand-primary) text-xs"
						onClick={addPreset}
						type="button"
					>
						+ Add
					</button>
				</div>
				{presets.map((p, i) => (
					<div className="flex items-center gap-2" key={`p-${i}`}>
						<input
							className="h-10 flex-1 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							onChange={(e) =>
								setPresets((prev) =>
									prev.map((row, idx) =>
										idx === i ? { ...row, label: e.target.value } : row,
									),
								)
							}
							placeholder="Half day"
							value={p.label}
						/>
						<input
							className="h-10 w-28 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
							min={0}
							onChange={(e) =>
								setPresets((prev) =>
									prev.map((row, idx) =>
										idx === i ? { ...row, priceMad: e.target.value } : row,
									),
								)
							}
							placeholder="800"
							step={1}
							type="number"
							value={p.priceMad}
						/>
						<button
							className="px-2 text-(--text-2) text-xs"
							onClick={() => removePreset(i)}
							type="button"
						>
							✕
						</button>
					</div>
				))}
			</div>

			<div className="flex items-center gap-3">
				<button
					className="rounded-xl bg-(--brand-primary) px-5 py-2.5 font-semibold text-sm text-white disabled:opacity-50"
					disabled={pending || !canSubmit}
					type="submit"
				>
					{pending ? "Saving…" : "Save settings"}
				</button>
				{message && (
					<span className="font-sans text-(--text-2) text-sm">{message}</span>
				)}
			</div>
		</form>
	);
}
