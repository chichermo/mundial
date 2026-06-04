import type { InputHTMLAttributes, ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, hint, error, children }: Props) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
      </span>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </label>
  );
}

export function inputClassName() {
  return "w-full rounded-xl border border-pitch-mid bg-pitch/80 px-4 py-3 text-cream placeholder:text-muted/60 transition-colors focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/30";
}

export function TextInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputClassName()} ${className ?? ""}`} {...props} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${inputClassName()} cursor-pointer`}
      {...props}
    />
  );
}
