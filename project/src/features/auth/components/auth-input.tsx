"use client";

import React from "react";
import { inputCls } from "./auth-layout";

type AuthInputProps = {
	type?: string;
	name?: string;
	placeholder?: string;
	value: string;
	onChange: (v: string) => void;
	required?: boolean;
	minLength?: number;
	autoComplete?: string;
};

export function AuthInput({
	type = "text",
	name,
	placeholder,
	value,
	onChange,
	required,
	minLength,
	autoComplete,
}: AuthInputProps) {
	return (
		<input
			autoComplete={autoComplete}
			className={inputCls}
			minLength={minLength}
			name={name}
			onChange={(e) => onChange(e.target.value)}
			placeholder={placeholder}
			required={required}
			type={type}
			value={value}
		/>
	);
}
