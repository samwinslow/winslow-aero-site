"use client";

import Link from "next/link";
import posthog from "posthog-js";
import type { ReactNode } from "react";

export default function ContactButton({
  children = "Get in touch",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const handleClick = () => {
    posthog.capture("contact_cta_clicked");
  };

  return (
    <Link
      href="/contact"
      onClick={handleClick}
      className={`mx-auto rounded-md bg-brand-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-blue/80 ${className}`}
    >
      {children}
    </Link>
  );
}
