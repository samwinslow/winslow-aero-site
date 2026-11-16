export const siteUrl = process.env.DEPLOY_PRIME_URL ?? "https://winslow.aero";

// Page metadata replaces the layout's alternates object whole, so a page that
// sets alternates spreads this to keep the feed link.
export const feedAlternateTypes = {
  "application/rss+xml": [{ url: "/feed.xml", title: "winslow.aero posts" }],
};

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
