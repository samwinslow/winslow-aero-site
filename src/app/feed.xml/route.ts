import { getAllArticles } from "../posts/articles";
import { siteUrl } from "../site-metadata";

// GET handlers are dynamic by default; prerender the feed like every page.
export const dynamic = "force-static";

const FEED_TITLE = "winslow.aero";
const FEED_DESCRIPTION =
  "Posts on flying, flight training, and software from Sam Winslow.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RSS wants RFC 822 dates; post dates are calendar days, read as UTC midnight.
function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

// Archived posts are left out, since their pages prerender as 404s.
export function GET() {
  const articles = getAllArticles();
  const feedUrl = `${siteUrl}/feed.xml`;

  const items = articles
    .map((article) => {
      const url = `${siteUrl}/posts/${article.slug}`;
      const categories = article.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(article.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(article.date)}</pubDate>`,
        `      <description>${escapeXml(article.copy)}</description>`,
        ...(categories ? [categories] : []),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuildDate = articles[0]
    ? `\n    <lastBuildDate>${rfc822(articles[0].date)}</lastBuildDate>`
    : "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${siteUrl}/posts</link>
    <description>${FEED_DESCRIPTION}</description>
    <language>en-us</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />${lastBuildDate}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
