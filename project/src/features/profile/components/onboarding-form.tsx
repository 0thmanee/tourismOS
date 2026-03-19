"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthLayout,
  AuthInput,
  AuthField,
  AuthSelect,
} from "~/features/auth";
import {
  ONBOARDING_STEPS,
  MOROCCAN_REGIONS,
  PRODUCT_CATEGORIES,
  ENTITY_TYPES,
  EXPORT_EXPERIENCE_OPTIONS,
  INITIAL_ONBOARDING_FORM,
  completeOnboardingAndGetRedirect,
  upsertProfile,
  type OnboardingFormData,
} from "~/features/profile";

const set =
  (key: keyof OnboardingFormData) =>
  (value: string | boolean | string[]) =>
  (prev: OnboardingFormData) => ({ ...prev, [key]: value });

const editModeBg =
  "linear-gradient(in oklab 160deg, oklab(14% -0.025 0.012) 0%, oklab(22% -0.038 0.018) 100%)";

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
        : { ...f, categories: [...f.categories, cat] }
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
          form.region
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
        e instanceof Error ? e.message : "Something went wrong. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const formContent = (
    <div className="w-full">
        <div className="w-full mb-8 shrink-0">
          <div className="flex items-center gap-0">
            {ONBOARDING_STEPS.map((s, i) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-sans font-bold text-xs transition-all"
                    style={
                      step > s.number
                        ? {
                            background: "rgba(74,222,128,0.15)",
                            border: "1px solid rgba(74,222,128,0.3)",
                            color: "#4ADE80",
                          }
                        : step === s.number
                          ? { background: "#C9913D", color: "#0D2818" }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "rgba(255,255,255,0.3)",
                            }
                    }
                  >
                    {step > s.number ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="#4ADE80"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 6l2.5 2.5 4.5-5" />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span
                    className="font-sans text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      color:
                        step === s.number
                          ? "rgba(255,255,255,0.9)"
                          : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className="flex-1 h-px mb-4 mx-2 min-w-[24px]"
                    style={{
                      background:
                        step > s.number
                          ? "rgba(74,222,128,0.3)"
                          : "rgba(255,255,255,0.08)",
                    }}
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
                <h1 className="font-serif font-bold text-[28px] text-white leading-tight">
                  Your business
                </h1>
                <p className="font-sans text-white/50 text-sm mt-1">
                  Legal and location details for your cooperative or company.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <AuthField label="First Name">
                    <AuthInput
                      placeholder="Rida"
                      value={form.firstName}
                      onChange={(v) => setForm(set("firstName")(v))}
                    />
                  </AuthField>
                  <AuthField label="Last Name">
                    <AuthInput
                      placeholder="Elmazary"
                      value={form.lastName}
                      onChange={(v) => setForm(set("lastName")(v))}
                    />
                  </AuthField>
                </div>
                <AuthField label="Phone Number">
                  <AuthInput
                    type="tel"
                    placeholder="+212 6XX XXX XXX"
                    value={form.phone}
                    onChange={(v) => setForm(set("phone")(v))}
                  />
                </AuthField>
                <AuthField label="Entity Type">
                  <AuthSelect
                    value={form.entityType}
                    onChange={(v) => setForm(set("entityType")(v))}
                    options={ENTITY_TYPES}
                    placeholder="Select entity type"
                  />
                </AuthField>
                <AuthField label="Entity Name">
                  <AuthInput
                    placeholder="Coopérative Tissint"
                    value={form.entityName}
                    onChange={(v) => setForm(set("entityName")(v))}
                  />
                </AuthField>
                <AuthField label="Registration Number (RC / ICE)">
                  <AuthInput
                    placeholder="RC-XXXX-MA-XXXXX"
                    value={form.registrationNumber}
                    onChange={(v) => setForm(set("registrationNumber")(v))}
                  />
                </AuthField>
                <div className="grid grid-cols-2 gap-4">
                  <AuthField label="Region">
                    <AuthSelect
                      value={form.region}
                      onChange={(v) => setForm(set("region")(v))}
                      options={MOROCCAN_REGIONS}
                      placeholder="Select region"
                    />
                  </AuthField>
                  <AuthField label="City">
                    <AuthInput
                      placeholder="Taliouine"
                      value={form.city}
                      onChange={(v) => setForm(set("city")(v))}
                    />
                  </AuthField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AuthField label="Year Established">
                    <AuthInput
                      placeholder="2018"
                      value={form.yearEstablished}
                      onChange={(v) => setForm(set("yearEstablished")(v))}
                    />
                  </AuthField>
                  <AuthField label="Website (optional)">
                    <AuthInput
                      placeholder="www.example.ma"
                      value={form.website}
                      onChange={(v) => setForm(set("website")(v))}
                    />
                  </AuthField>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-serif font-bold text-[28px] text-white leading-tight">
                  Your products
                </h1>
                <p className="font-sans text-white/50 text-sm mt-1">
                  Select all categories you produce. You can add specific listings
                  later.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="font-sans text-[10px] font-bold tracking-[0.14em] text-white/50 uppercase mb-2.5">
                    Product Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_CATEGORIES.map((cat) => {
                      const selected = form.categories.includes(cat.label);
                      return (
                        <button
                          key={cat.label}
                          type="button"
                          onClick={() => toggleCategory(cat.label)}
                          className="font-sans text-[12px] font-semibold rounded-xl px-4 py-2 transition-all"
                          style={
                            selected
                              ? {
                                  background: `${cat.color}22`,
                                  color: cat.color,
                                  border: `1px solid ${cat.color}55`,
                                }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.5)",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                }
                          }
                        >
                          {selected && (
                            <span className="mr-1.5 text-[10px]">✓</span>
                          )}
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                  {form.categories.length === 0 && (
                    <p className="font-sans text-[11px] text-white/30 mt-2">
                      Select at least one category to continue.
                    </p>
                  )}
                </div>
                <AuthField label="Estimated Annual Capacity">
                  <AuthInput
                    placeholder="e.g. 2,000 L / year or 500 kg / year"
                    value={form.annualCapacity}
                    onChange={(v) => setForm(set("annualCapacity")(v))}
                  />
                </AuthField>
                <AuthField label="Export Experience">
                  <AuthSelect
                    value={form.exportExperience}
                    onChange={(v) => setForm(set("exportExperience")(v))}
                    options={EXPORT_EXPERIENCE_OPTIONS}
                    placeholder="Select experience level"
                  />
                </AuthField>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-serif font-bold text-[28px] text-white leading-tight">
                  Review & submit
                </h1>
                <p className="font-sans text-white/50 text-sm mt-1">
                  Confirm your details before completing your profile.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-white/6">
                    <span className="font-sans text-[11px] font-bold tracking-wider text-white/40 uppercase">
                      Business
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-sans text-[11px] text-gold hover:text-gold/70 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-y-2">
                    {[
                      { label: "Name", value: `${form.firstName} ${form.lastName}` },
                      { label: "Entity", value: form.entityName },
                      { label: "Type", value: form.entityType },
                      { label: "Region", value: form.region },
                      { label: "Phone", value: form.phone },
                    ].map((r) => (
                      <div key={r.label}>
                        <p className="font-sans text-[10px] text-white/35 uppercase tracking-wider">
                          {r.label}
                        </p>
                        <p className="font-sans text-sm text-white/80 mt-0.5">
                          {r.value || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-white/6">
                    <span className="font-sans text-[11px] font-bold tracking-wider text-white/40 uppercase">
                      Products
                    </span>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="font-sans text-[11px] text-gold hover:text-gold/70 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {form.categories.map((c) => {
                        const cat = PRODUCT_CATEGORIES.find(
                          (p) => p.label === c
                        );
                        return (
                          <span
                            key={c}
                            className="font-sans text-[11px] font-semibold rounded-full px-2.5 py-0.5"
                            style={{
                              background: `${cat?.color ?? "#C9913D"}22`,
                              color: cat?.color ?? "#C9913D",
                              border: `1px solid ${cat?.color ?? "#C9913D"}44`,
                            }}
                          >
                            {c}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={
                      form.agreeTerms
                        ? { background: "#C9913D", border: "1px solid #C9913D" }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }
                    }
                    onClick={() =>
                      setForm(set("agreeTerms")(!form.agreeTerms))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      setForm(set("agreeTerms")(!form.agreeTerms))
                    }
                    role="button"
                    tabIndex={0}
                    aria-checked={form.agreeTerms}
                  >
                    {form.agreeTerms && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="#0D2818"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 5l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                  <span className="font-sans text-[13px] text-white/60 leading-relaxed">
                    I agree to the TourismOS Terms of Service and Privacy
                    Policy <span className="text-gold">*</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    style={
                      form.agreeMarketing
                        ? { background: "#C9913D", border: "1px solid #C9913D" }
                        : {
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          }
                    }
                    onClick={() =>
                      setForm(set("agreeMarketing")(!form.agreeMarketing))
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      setForm(set("agreeMarketing")(!form.agreeMarketing))
                    }
                    role="button"
                    tabIndex={0}
                    aria-checked={form.agreeMarketing}
                  >
                    {form.agreeMarketing && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="#0D2818"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 5l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                  <span className="font-sans text-[13px] text-white/60 leading-relaxed">
                    I&apos;d like to receive updates about new features and
                    export opportunities
                  </span>
                </label>
              </div>
            </div>
          )}

          {(step === 3 && submitError) && (
            <div
              className="rounded-xl px-4 py-3 font-sans text-sm text-[#f87171] mt-4"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.25)",
              }}
            >
              {submitError}
            </div>
          )}

          <div className="flex items-center justify-between mt-8 gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="font-sans text-sm font-medium rounded-xl px-6 py-3 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => canNext() && setStep(step + 1)}
                className="font-sans font-semibold text-sm rounded-xl px-8 py-3 transition-all"
                style={
                  canNext()
                    ? { background: "#C9913D", color: "#0D2818" }
                    : {
                        background: "rgba(201,145,61,0.2)",
                        color: "rgba(201,145,61,0.4)",
                        cursor: "not-allowed",
                      }
                }
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext() || submitting}
                onClick={handleSubmit}
                className="font-sans font-semibold text-sm rounded-xl px-8 py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                style={
                  canNext() && !submitting
                    ? { background: "#C9913D", color: "#0D2818" }
                    : {
                        background: "rgba(201,145,61,0.2)",
                        color: "rgba(201,145,61,0.4)",
                        cursor: "not-allowed",
                      }
                }
              >
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Complete profile"}
              </button>
            )}
          </div>
        </div>
      </div>
  );

  if (isEdit) {
    return (
      <div className="p-4 lg:p-6">
        <div
          className="rounded-xl overflow-hidden max-w-lg mx-auto"
          style={{ background: editModeBg }}
        >
          <div className="px-6 lg:px-10 py-6 border-b border-white/10">
            <Link
              href="/producer/profile"
              className="font-sans text-sm text-white/60 hover:text-white transition-colors"
            >
              ← Back to profile
            </Link>
            <h1 className="font-serif font-bold text-[22px] text-white mt-2">
              Edit profile
            </h1>
            <p className="font-sans text-white/50 text-sm mt-0.5">
              Update your business and contact details.
            </p>
          </div>
          <div className="px-6 lg:px-10 py-8">{formContent}</div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Complete your profile"
      subtitle="Tell us about your business to get started"
      contentClassName="max-w-lg"
      contentCenter={false}
    >
      {formContent}
    </AuthLayout>
  );
}
