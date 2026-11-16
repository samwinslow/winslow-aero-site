import type { MetadataRoute } from "next";
import { getAllArticles } from "./posts/articles";
import { siteUrl } from "./site-metadata";

// Archived posts are left out, since their pages prerender as 404s.
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();
  const latestPostDate = articles[0]?.date;

  return [
    { url: `${siteUrl}/`, lastModified: latestPostDate },
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/posts`, lastModified: latestPostDate },
    ...articles.map((article) => ({
      url: `${siteUrl}/posts/${article.slug}`,
      lastModified: article.date,
    })),
  ];
}
