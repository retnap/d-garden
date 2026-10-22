"use client";

import { useState } from "react";

type AuthInputProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export default function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
  name,
  value,
  onChange,
  error,
  disabled = false,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-[#193128]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name ?? id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#193128] outline-none transition placeholder:text-[#9AA9A0] focus:ring-2 focus:ring-[#1F5D42]/15 disabled:cursor-not-allowed disabled:bg-[#F4FAF6] disabled:opacity-60 ${
            isPassword ? "pr-20" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#DCE8E1] focus:border-[#1F5D42]"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={disabled}
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#65766D] transition-colors hover:text-[#1F5D42] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] disabled:cursor-not-allowed"
          >
            {showPassword ? "Gizle" : "Göster"}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 text-xs leading-5 text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
