"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AuthField, AuthInput, AuthLayout, AuthSelect } from "~/features/auth";
import {
	completeOnboardingAndGetRedirect,
	ENTITY_TYPES,
	EXPORT_EXPERIENCE_OPTIONS,
	INITIAL_ONBOARDING_FORM,
	MOROCCAN_REGIONS,
	ONBOARDING_STEPS,
	type OnboardingFormData,
	PRODUCT_CATEGORIES,
	upsertProfile,
} from "~/features/profile";

const set =
	(key: keyof OnboardingFormData) =>
	(value: string | boolean | string[]) =>
	(prev: OnboardingFormData) => ({ ...prev, [key]: value });

export function OnboardingForm({
	initialData,
	mode = "onboarding",
}: {
	initialData?: Partial<OnboardingFormData>;
	mode?: "onboarding" | "edit";
}) {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [form, setForm] = useState<OnboardingFormData>({
		...INITIAL_ONBOARDING_FORM,
		...initialData,
	});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const isEdit = mode === "edit";

	const toggleCategory = (cat: string) => {
		setForm((f) =>
			f.categories.includes(cat)
				? { ...f, categories: f.categories.filter((c) => c !== cat) }
				: { ...f, categories: [...f.categories, cat] },
		);
	};

	const canNext = () => {
		if (step === 1)
			return Boolean(
				form.firstName &&
					form.lastName &&
					form.phone &&
					form.entityType &&
					form.entityName &&
					form.region,
			);
		if (step === 2) return form.categories.length > 0;
		if (step === 3) return form.agreeTerms;
		return false;
	};

	async function handleSubmit() {
		if (!canNext() || submitting) return;
		setSubmitError(null);
		setSubmitting(true);
		try {
			if (isEdit) {
				await upsertProfile(form);
				router.push("/producer/profile");
				router.refresh();
			} else {
				const { redirectTo } = await completeOnboardingAndGetRedirect(form);
				router.push(redirectTo);
				router.refresh();
			}
		} catch (e) {
			setSubmitError(
				e instanceof Error ? e.message : "Something went wrong. Try again.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	const formContent = (
		<div className="w-full">
			<div className="mb-8 w-full shrink-0">
				<div className="flex items-center gap-0">
					{ONBOARDING_STEPS.map((s, i) => (
						<React.Fragment key={s.number}>
							<div className="flex flex-col items-center gap-1.5">
								<div
									className={`flex h-8 w-8 items-center justify-center rounded-full border font-bold font-sans text-xs transition-all ${
										step > s.number
											? "border-zellige-teal/30 bg-zellige-teal/15 text-zellige-teal"
											: step === s.number
												? "border-gold bg-gold text-forest-dark"
												: "auth-input text-white/30"
									}`}
								>
									{step > s.number ? <Check aria-hidden size={12} /> : s.number}
								</div>
								<span
									className={`font-sans font-semibold text-[10px] uppercase tracking-wider ${
										step === s.number ? "text-white/90" : "text-white/30"
									}`}
								>
									{s.label}
								</span>
							</div>
							{i < ONBOARDING_STEPS.length - 1 && (
								<div
									className={`mx-2 mb-4 h-px min-w-[24px] flex-1 ${
										step > s.number ? "bg-zellige-teal/30" : "bg-white/10"
									}`}
								/>
							)}
						</React.Fragment>
					))}
				</div>
			</div>

			<div className="w-full flex-1">
				{step === 1 && (
					<div className="flex flex-col gap-6">
						<div>
							<h1 className="font-bold font-serif text-[28px] text-white leading-tight">
								Your business
							</h1>
							<p className="mt-1 font-sans text-sm text-white/50">
								Legal and location details for your cooperative or company.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							<div className="grid grid-cols-2 gap-4">
								<AuthField label="First Name">
									<AuthInput
										onChange={(v) => setForm(set("firstName")(v))}
										placeholder="Rida"
										value={form.firstName}
									/>
								</AuthField>
								<AuthField label="Last Name">
									<AuthInput
										onChange={(v) => setForm(set("lastName")(v))}
										placeholder="Elmazary"
										value={form.lastName}
									/>
								</AuthField>
							</div>
							<AuthField label="Phone Number">
								<AuthInput
									onChange={(v) => setForm(set("phone")(v))}
									placeholder="+212 6XX XXX XXX"
									type="tel"
									value={form.phone}
								/>
							</AuthField>
							<AuthField label="Entity Type">
								<AuthSelect
									onChange={(v) => setForm(set("entityType")(v))}
									options={ENTITY_TYPES}
									placeholder="Select entity type"
									value={form.entityType}
								/>
							</AuthField>
							<AuthField label="Entity Name">
								<AuthInput
									onChange={(v) => setForm(set("entityName")(v))}
									placeholder="Coopérative Tissint"
									value={form.entityName}
								/>
							</AuthField>
							<AuthField label="Registration Number (RC / ICE)">
								<AuthInput
									onChange={(v) => setForm(set("registrationNumber")(v))}
									placeholder="RC-XXXX-MA-XXXXX"
									value={form.registrationNumber}
								/>
							</AuthField>
							<div className="grid grid-cols-2 gap-4">
								<AuthField label="Region">
									<AuthSelect
										onChange={(v) => setForm(set("region")(v))}
										options={MOROCCAN_REGIONS}
										placeholder="Select region"
										value={form.region}
									/>
								</AuthField>
								<AuthField label="City">
									<AuthInput
										onChange={(v) => setForm(set("city")(v))}
										placeholder="Taliouine"
										value={form.city}
									/>
								</AuthField>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<AuthField label="Year Established">
									<AuthInput
										onChange={(v) => setForm(set("yearEstablished")(v))}
										placeholder="2018"
										value={form.yearEstablished}
									/>
								</AuthField>
								<AuthField label="Website (optional)">
									<AuthInput
										onChange={(v) => setForm(set("website")(v))}
										placeholder="www.example.ma"
										value={form.website}
									/>
								</AuthField>
							</div>
						</div>
					</div>
				)}

				{step === 2 && (
					<div className="flex flex-col gap-6">
						<div>
							<h1 className="font-bold font-serif text-[28px] text-white leading-tight">
								Your products
							</h1>
							<p className="mt-1 font-sans text-sm text-white/50">
								Select all categories you produce. You can add specific listings
								later.
							</p>
						</div>
						<div className="flex flex-col gap-4">
							<div>
								<p className="mb-2.5 font-bold font-sans text-[10px] text-white/50 uppercase tracking-[0.14em]">
									Product Categories
								</p>
								<div className="flex flex-wrap gap-2">
									{PRODUCT_CATEGORIES.map((cat) => {
										const selected = form.categories.includes(cat.label);
										return (
											<button
												className={`rounded-xl border px-4 py-2 font-sans font-semibold text-[12px] transition-all ${
													selected
														? "border-gold bg-gold text-forest-dark"
														: "pill-inverse"
												}`}
												key={cat.label}
												onClick={() => toggleCategory(cat.label)}
												type="button"
											>
												{cat.label}
											</button>
										);
									})}
								</div>
								{form.categories.length === 0 && (
									<p className="mt-2 font-sans text-[11px] text-white/30">
										Select at least one category to continue.
									</p>
								)}
							</div>
							<AuthField label="Estimated Annual Capacity">
								<AuthInput
									onChange={(v) => setForm(set("annualCapacity")(v))}
									placeholder="e.g. 2,000 L / year or 500 kg / year"
									value={form.annualCapacity}
								/>
							</AuthField>
							<AuthField label="Export Experience">
								<AuthSelect
									onChange={(v) => setForm(set("exportExperience")(v))}
									options={EXPORT_EXPERIENCE_OPTIONS}
									placeholder="Select experience level"
									value={form.exportExperience}
								/>
							</AuthField>
						</div>
					</div>
				)}

				{step === 3 && (
					<div className="flex flex-col gap-6">
						<div>
							<h1 className="font-bold font-serif text-[28px] text-white leading-tight">
								Review & submit
							</h1>
							<p className="mt-1 font-sans text-sm text-white/50">
								Confirm your details before completing your profile.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<div className="auth-card overflow-hidden rounded-xl">
								<div className="flex items-center justify-between border-white/6 border-b px-4 py-3">
									<span className="font-bold font-sans text-[11px] text-white/40 uppercase tracking-wider">
										Business
									</span>
									<button
										className="font-sans text-[11px] text-gold transition-colors hover:text-gold/70"
										onClick={() => setStep(1)}
										type="button"
									>
										Edit
									</button>
								</div>
								<div className="grid grid-cols-2 gap-y-2 px-4 py-3">
									{[
										{
											label: "Name",
											value: `${form.firstName} ${form.lastName}`,
										},
										{ label: "Entity", value: form.entityName },
										{ label: "Type", value: form.entityType },
										{ label: "Region", value: form.region },
										{ label: "Phone", value: form.phone },
									].map((r) => (
										<div key={r.label}>
											<p className="font-sans text-[10px] text-white/35 uppercase tracking-wider">
												{r.label}
											</p>
											<p className="mt-0.5 font-sans text-sm text-white/80">
												{r.value || "—"}
											</p>
										</div>
									))}
								</div>
							</div>
							<div className="auth-card overflow-hidden rounded-xl">
								<div className="flex items-center justify-between border-white/6 border-b px-4 py-3">
									<span className="font-bold font-sans text-[11px] text-white/40 uppercase tracking-wider">
										Products
									</span>
									<button
										className="font-sans text-[11px] text-gold transition-colors hover:text-gold/70"
										onClick={() => setStep(2)}
										type="button"
									>
										Edit
									</button>
								</div>
								<div className="px-4 py-3">
									<div className="flex flex-wrap gap-1.5">
										{form.categories.map((c) => (
											<span
												className="pill-inverse rounded-full px-2.5 py-0.5 font-sans font-semibold text-[11px]"
												key={c}
											>
												{c}
											</span>
										))}
									</div>
								</div>
							</div>
							<label className="flex cursor-pointer items-start gap-3">
								<div
									aria-checked={form.agreeTerms}
									className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
										form.agreeTerms ? "border-gold bg-gold" : "auth-input"
									}`}
									onClick={() => setForm(set("agreeTerms")(!form.agreeTerms))}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										setForm(set("agreeTerms")(!form.agreeTerms))
									}
									role="button"
									tabIndex={0}
								>
									{form.agreeTerms && (
										<Check aria-hidden className="text-forest-dark" size={12} />
									)}
								</div>
								<span className="font-sans text-[13px] text-white/60 leading-relaxed">
									I agree to the TourismOS Terms of Service and Privacy Policy{" "}
									<span className="text-gold">*</span>
								</span>
							</label>
							<label className="flex cursor-pointer items-start gap-3">
								<div
									aria-checked={form.agreeMarketing}
									className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
										form.agreeMarketing ? "border-gold bg-gold" : "auth-input"
									}`}
									onClick={() =>
										setForm(set("agreeMarketing")(!form.agreeMarketing))
									}
									onKeyDown={(e) =>
										e.key === "Enter" &&
										setForm(set("agreeMarketing")(!form.agreeMarketing))
									}
									role="button"
									tabIndex={0}
								>
									{form.agreeMarketing && (
										<Check aria-hidden className="text-forest-dark" size={12} />
									)}
								</div>
								<span className="font-sans text-[13px] text-white/60 leading-relaxed">
									I&apos;d like to receive updates about new features and export
									opportunities
								</span>
							</label>
						</div>
					</div>
				)}

				{step === 3 && submitError && (
					<div className="auth-error mt-4 rounded-xl px-4 py-3 font-sans text-sm">
						{submitError}
					</div>
				)}

				<div className="mt-8 flex items-center justify-between gap-4">
					{step > 1 ? (
						<button
							className="btn btn-ghost rounded-xl border-accent px-6 py-3 font-medium font-sans text-sm transition-colors"
							onClick={() => setStep(step - 1)}
							type="button"
						>
							← Back
						</button>
					) : (
						<span />
					)}
					{step < 3 ? (
						<button
							className={`btn rounded-xl px-8 py-3 font-sans font-semibold text-sm transition-all ${
								canNext() ? "btn-accent" : "btn-ghost"
							}`}
							onClick={() => canNext() && setStep(step + 1)}
							type="button"
						>
							Continue →
						</button>
					) : (
						<button
							className={`btn rounded-xl px-8 py-3 font-sans font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
								canNext() && !submitting ? "btn-accent" : "btn-ghost"
							}`}
							disabled={!canNext() || submitting}
							onClick={handleSubmit}
							type="button"
						>
							{submitting
								? "Saving…"
								: isEdit
									? "Save changes"
									: "Complete profile"}
						</button>
					)}
				</div>
			</div>
		</div>
	);

	if (isEdit) {
		return (
			<div className="p-4 lg:p-6">
				<div className="auth-gradient-bg mx-auto max-w-lg overflow-hidden rounded-xl">
					<div className="border-white/10 border-b px-6 py-6 lg:px-10">
						<Link
							className="font-sans text-sm text-white/60 transition-colors hover:text-white"
							href="/producer/profile"
						>
							← Back to profile
						</Link>
						<h1 className="mt-2 font-bold font-serif text-[22px] text-white">
							Edit profile
						</h1>
						<p className="mt-0.5 font-sans text-sm text-white/50">
							Update your business and contact details.
						</p>
					</div>
					<div className="px-6 py-8 lg:px-10">{formContent}</div>
				</div>
			</div>
		);
	}

	return (
		<AuthLayout
			contentCenter={false}
			contentClassName="max-w-lg"
			subtitle="Tell us about your business to get started"
			title="Complete your profile"
		>
			{formContent}
		</AuthLayout>
	);
}
