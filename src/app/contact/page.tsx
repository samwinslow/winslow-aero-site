import type { Metadata } from "next";
import ContactLinks from "./ContactLinks";
import TallyEmbed from "./TallyEmbed";

const description =
  "Get in touch with Sam Winslow for ground instruction, aircraft ferrying, software development, or startup advisement.";

export const metadata: Metadata = {
  title: "Contact",
  description,
  openGraph: {
    title: "Contact | winslow.aero",
    description,
    url: "/contact",
  },
  twitter: {
    title: "Contact | winslow.aero",
    description,
  },
};

export default function Contact() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <TallyEmbed />
      <ContactLinks />
    </main>
  );
}
