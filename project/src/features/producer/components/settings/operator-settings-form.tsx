"use client";

import React, { useMemo, useState, useTransition } from "react";
import { updateMyOrganizationSettings } from "~/app/api/organization-settings/actions";
import type { OrganizationSettingsRow } from "~/app/api/organization-settings";

type Props = {
  initial: OrganizationSettingsRow;
};

export function OperatorSettingsForm({ initial }: Props) {
  const [businessName, setBusinessName] = useState(initial.businessName ?? "");
  const [activities, setActivities] = useState<string[]>(initial.activities.length ? initial.activities : [""]);
  const [presets, setPresets] = useState<{ label: string; priceMad: string }[]>(
    initial.pricingPresets.length
      ? initial.pricingPresets.map((p) => ({ label: p.label, priceMad: String(p.priceMad) }))
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
            .filter((p) => p.label && Number.isFinite(p.priceMad) && p.priceMad >= 0),
        });
        setMessage("Saved.");
      } catch {
        setMessage("Could not save settings.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="p-4 lg:p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="font-serif font-bold text-[18px] text-(--text-1)">Settings</h2>
        <p className="font-sans text-sm text-(--text-2) mt-1">Business name, activity labels, and pricing presets for quick booking.</p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-sans text-xs font-semibold text-(--text-2)">Business display name</span>
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Shown in quick-add hints"
          className="h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
        />
      </label>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-semibold text-(--text-2)">Activities list</span>
          <button type="button" onClick={addActivity} className="text-xs font-semibold text-(--brand-primary)">
            + Add
          </button>
        </div>
        {activities.map((a, i) => (
          <div key={`a-${i}`} className="flex gap-2">
            <input
              value={a}
              onChange={(e) =>
                setActivities((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
              }
              className="flex-1 h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
              placeholder="Desert tour, Cooking class…"
            />
            <button type="button" onClick={() => removeActivity(i)} className="text-xs text-(--text-2) px-2">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs font-semibold text-(--text-2)">Pricing presets (MAD)</span>
          <button type="button" onClick={addPreset} className="text-xs font-semibold text-(--brand-primary)">
            + Add
          </button>
        </div>
        {presets.map((p, i) => (
          <div key={`p-${i}`} className="flex gap-2 items-center">
            <input
              value={p.label}
              onChange={(e) =>
                setPresets((prev) =>
                  prev.map((row, idx) => (idx === i ? { ...row, label: e.target.value } : row)),
                )
              }
              className="flex-1 h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
              placeholder="Half day"
            />
            <input
              type="number"
              min={0}
              step={1}
              value={p.priceMad}
              onChange={(e) =>
                setPresets((prev) =>
                  prev.map((row, idx) => (idx === i ? { ...row, priceMad: e.target.value } : row)),
                )
              }
              className="w-28 h-10 rounded-lg border border-white/70 bg-white/80 px-3 text-sm"
              placeholder="800"
            />
            <button type="button" onClick={() => removePreset(i)} className="text-xs text-(--text-2) px-2">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || !canSubmit}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-(--brand-primary) text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {message && <span className="font-sans text-sm text-(--text-2)">{message}</span>}
      </div>
    </form>
  );
}
