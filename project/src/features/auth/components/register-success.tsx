"use client";

import { CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import React from "react";
import type { RegisterFormData } from "../config/register";

export function RegisterSuccess({ form }: { form: RegisterFormData }) {
	return (
		<div className="auth-shell items-center justify-center px-4">
			<div aria-hidden className="auth-pattern bg-moroccan-pattern" />
			<div className="relative z-10 flex max-w-md flex-col items-center gap-6 text-center">
				<div className="badge badge-confirmed flex h-20 w-20 items-center justify-center rounded-full">
					<CheckCircle2 aria-hidden size={36} />
				</div>
				<div>
					<div className="mb-2 flex items-center justify-center gap-2">
						<Star aria-hidden className="text-gold" size={14} />
						<span className="font-sans font-semibold text-[11px] text-white/50 uppercase tracking-[0.18em]">
							Application Submitted
						</span>
						<Star aria-hidden className="text-gold" size={14} />
					</div>
					<h1 className="font-bold font-serif text-[32px] text-white leading-tight">
						Welcome, {form.firstName}.
					</h1>
					<p className="mt-3 max-w-sm font-sans text-base text-white/60 leading-relaxed">
						Your application has been received. Our team will review your
						documents and get back to you within 3-5 business days.
					</p>
				</div>
				<div className="auth-card flex w-full flex-col gap-3 rounded-2xl p-5 text-left">
					{[
						{
							step: "1",
							label: "Application review",
							detail: "1-2 business days",
						},
						{
							step: "2",
							label: "Document verification",
							detail: "1-2 business days",
						},
						{
							step: "3",
							label: "On-site audit scheduled",
							detail: "1-3 weeks",
						},
						{
							step: "4",
							label: "Booking workflow enabled",
							detail: "Up to 1 week",
						},
					].map((s) => (
						<div className="flex items-center gap-3" key={s.step}>
							<div className="auth-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold font-sans text-[10px] text-gold">
								{s.step}
							</div>
							<div className="flex flex-1 items-center justify-between gap-2">
								<span className="font-sans text-sm text-white/80">
									{s.label}
								</span>
								<span className="font-sans text-[11px] text-white/35">
									{s.detail}
								</span>
							</div>
						</div>
					))}
				</div>
				<div className="flex flex-wrap items-center justify-center gap-3">
					<Link
						className="btn btn-accent rounded-xl px-8 py-3.5 font-sans font-semibold text-sm transition-colors"
						href="/producer"
					>
						Go to Dashboard
					</Link>
					<Link
						className="font-sans text-sm text-white/60 transition-colors hover:text-white/80"
						href="/"
					>
						Back to Homepage
					</Link>
				</div>
			</div>
		</div>
	);
}
