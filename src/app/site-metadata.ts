// Page metadata replaces the layout's openGraph and twitter objects whole, so
// each page spreads these to keep the share image and card settings.
const shareImage = {
  url: "/og-image-wtext.jpg",
  width: 1200,
  height: 630,
};

export const sharedOpenGraph = {
  siteName: "winslow.aero",
  images: [shareImage],
  locale: "en_US",
  type: "website" as const,
};

export const sharedTwitter = {
  card: "summary_large_image" as const,
  images: [shareImage.url],
};
