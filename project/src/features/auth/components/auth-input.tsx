"use client";

import React, { useState } from "react";
import { inputCls, inputStyle, inputFocusStyle } from "./auth-layout";

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
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={inputCls}
      style={focused ? inputFocusStyle : inputStyle}
      required={required}
      minLength={minLength}
      autoComplete={autoComplete}
    />
  );
}
