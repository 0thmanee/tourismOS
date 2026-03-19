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
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
    />
  );
}
