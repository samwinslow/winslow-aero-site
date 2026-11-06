import Link from "next/link";
import { formatDate, getAllArticles } from "./articles";
import { blogMetadata } from "./metadata";

export const metadata = blogMetadata({
  title: "Posts",
  description:
    "Posts for pilots and people interested in flying: training, gear, skills, destinations, community, and ownership.",
  path: "/posts",
  type: "website",
});

export default function Blog() {
  const articles = getAllArticles();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-semibold">Posts</h1>

      {articles.length === 0 ? (
        <p className="text-lg">No posts yet.</p>
      ) : (
        <ul className="flex flex-col gap-8">
          {articles.map(({ slug, title, date, copy }) => (
            <li key={slug} className="flex flex-col gap-1">
              <Link
                href={`/posts/${slug}`}
                className="text-xl font-semibold hover:underline"
              >
                {title}
              </Link>
              <time dateTime={date} className="text-foreground/70">
                {formatDate(date)}
              </time>
              <p className="text-lg">{copy}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
