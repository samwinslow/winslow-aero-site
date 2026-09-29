import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-b border-black/10 bg-[var(--background)]/80 px-6 py-4 backdrop-blur">
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
      <nav className="col-start-2 flex gap-1">
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
    </header>
  );
}
