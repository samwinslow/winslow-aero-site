import type { Metadata } from "next";
import { sharedOpenGraph, sharedTwitter } from "../site-metadata";

type BlogMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type: "website" | "article";
};

export function blogMetadata({
  title,
  description,
  path,
  image,
  type,
}: BlogMetadataOptions): Metadata {
  const fullTitle = `${title} | winslow.aero`;

  return {
    title,
    description,
    openGraph: {
      ...sharedOpenGraph,
      title: fullTitle,
      description,
      url: path,
      type,
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      ...sharedTwitter,
      title: fullTitle,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
