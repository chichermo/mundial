import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col gap-4 border-b border-pitch-mid/40 pb-6 sm:gap-6 sm:pb-8 md:flex-row md:flex-wrap md:items-end md:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="mb-2 font-display text-xs tracking-[0.2em] text-lime sm:text-sm sm:tracking-[0.25em]">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl leading-none text-cream sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
