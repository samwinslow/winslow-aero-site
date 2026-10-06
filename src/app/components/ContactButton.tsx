import Link from "next/link";
import type { ReactNode } from "react";

export default function ContactButton({
  children = "Get in touch",
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href="/contact"
      className={`mx-auto rounded-md bg-brand-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-blue/80 ${className}`}
    >
      {children}
    </Link>
  );
}
