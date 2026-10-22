"use client";

import posthog from "posthog-js";

export default function ContactLinks() {
  const captureContactMethod = (contactMethod: "linkedin" | "email") => {
    posthog.capture("contact_method_selected", { contact_method: contactMethod });
  };

  return (
    <>
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
    </>
  );
}
