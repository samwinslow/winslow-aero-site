"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LinkedInIcon from "./icons/LinkedInIcon";
import YouTubeIcon from "./icons/YouTubeIcon";
import MenuIcon from "./icons/MenuIcon";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const socials = [
  {
    href: "https://www.youtube.com/@s.winslow",
    label: "YouTube",
    icon: YouTubeIcon,
  },
  {
    href: "https://linkedin.com/in/sambwinslow/",
    label: "LinkedIn",
    icon: LinkedInIcon,
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[var(--background)]/80 backdrop-blur">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image
            src="/stamp/stamp-72.png"
            alt=""
            width={24}
            height={24}
            unoptimized
          />
          winslow.aero
        </Link>

        <nav className="col-start-2 hidden gap-1 sm:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-black/[0.06]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 hidden items-center justify-end gap-3 sm:flex">
          {socials.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded-md p-1.5 hover:bg-black/[0.06]"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="col-start-3 justify-self-end rounded-md p-1.5 hover:bg-black/[0.06] sm:hidden"
        >
          <MenuIcon open={menuOpen} className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-black/10 px-6 py-4 sm:hidden"
        >
          <nav className="flex flex-col gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-black/[0.06]"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3 px-3">
            {socials.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-md p-1.5 hover:bg-black/[0.06]"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
