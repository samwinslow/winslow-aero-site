import type { Metadata } from "next";

const DEFAULT_IMAGE = "/og-image-wtext.jpg";

type BlogMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type: "website" | "article";
};

// Page metadata replaces the layout's openGraph and twitter objects whole,
// so every field is stated here.
export function blogMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type,
}: BlogMetadataOptions): Metadata {
  const fullTitle = `${title} | winslow.aero`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: "winslow.aero",
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
