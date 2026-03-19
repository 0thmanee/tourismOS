"use client";

import React from "react";
import { inputCls } from "./auth-layout";

type AuthSelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
};

export function AuthSelect({
  value,
  onChange,
  options,
  placeholder,
}: AuthSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls + " appearance-none"}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
