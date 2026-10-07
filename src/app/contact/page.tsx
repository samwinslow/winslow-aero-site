"use client";

import Script from "next/script";
import posthog from "posthog-js";

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

export default function Contact() {
  const captureContactMethod = (contactMethod: "linkedin" | "email") => {
    posthog.capture("contact_method_selected", { contact_method: contactMethod });
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <iframe
        data-tally-src="https://tally.so/embed/NpG0Vb?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        width="100%"
        height="500"
        title="Contact form"
        className="mt-4"
      />
      <Script
        id="tally-js"
        src="https://tally.so/widgets/embed.js"
        onReady={() => {
          window.Tally?.loadEmbeds();
        }}
      />
      <a
        href="https://linkedin.com/in/sambwinslow/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => captureContactMethod("linkedin")}
        className="text-lg font-medium underline underline-offset-4"
      >
        LinkedIn
      </a>
      <a
        href="mailto:sam@winslow.aero"
        onClick={() => captureContactMethod("email")}
        className="text-lg font-medium underline underline-offset-4"
      >
        sam@winslow.aero
      </a>
    </main>
  );
}
