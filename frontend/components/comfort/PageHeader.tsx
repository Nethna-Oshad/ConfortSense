"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
  backLabel = "Go back",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-2 text-sm text-[#7F93B3] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-[#7F93B3]">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-[#7F93B3] md:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
