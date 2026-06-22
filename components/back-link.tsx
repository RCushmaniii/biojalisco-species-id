"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import { useLanguage } from "@/hooks/use-language";

/**
 * Context-aware back link for the observation detail page.
 * `from=dashboard` (set when navigating from a dashboard card) sends the user
 * back to their dashboard; otherwise it defaults to the public observations
 * gallery (direct links, SEO, shared URLs).
 */
export function BackLink({ from }: { from?: string }) {
  const { t } = useLanguage();
  const toDashboard = from === "dashboard";
  const href = toDashboard ? "/dashboard" : "/observations";
  const label = toDashboard
    ? t("Back to Dashboard", "Volver al Panel")
    : t("Back to Observations", "Volver a Observaciones");

  return (
    <Link href={href} className="back-link">
      <ArrowLeftIcon className="icon icon-sm" />
      {label}
    </Link>
  );
}
