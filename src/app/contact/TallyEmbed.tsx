"use client";

import Script from "next/script";

declare global {
  interface Window {
    Tally?: {
      loadEmbeds: () => void;
    };
  }
}

export default function TallyEmbed() {
  return (
    <>
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
    </>
  );
}
