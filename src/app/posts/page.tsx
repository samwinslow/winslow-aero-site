import Image from "next/image";
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
        <ul className="flex flex-col gap-1">
          {articles.map(({ slug, title, date, copy, image }) => (
            <li key={slug}>
              <Link
                href={`/posts/${slug}`}
                className="group flex flex-col gap-4 rounded-lg border border-transparent p-4 transition-colors hover:border-foreground/10 hover:bg-foreground/5 sm:flex-row"
              >
                <div className="relative aspect-[3/2] w-full flex-shrink-0 overflow-hidden rounded-lg bg-foreground/10 sm:aspect-auto sm:h-20 sm:w-30">
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 40rem) 7.5rem, calc(100vw - 5rem)"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 className="text-xl font-semibold group-hover:underline">
                    {title}
                  </h2>
                  <time dateTime={date} className="text-foreground/70">
                    {formatDate(date)}
                  </time>
                  <p className="text-lg">{copy}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
