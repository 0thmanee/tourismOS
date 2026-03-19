"use client";

import React, { useState } from "react";
import { inputCls, inputStyle, inputFocusStyle } from "./auth-layout";

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
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={inputCls + " appearance-none"}
      style={focused ? inputFocusStyle : inputStyle}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} style={{ background: "#0D2818", color: "white" }}>
          {o}
        </option>
      ))}
    </select>
  );
}
