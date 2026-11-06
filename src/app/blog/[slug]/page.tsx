import { notFound } from "next/navigation";
import { formatDate, getArticle, getArticleSlugs } from "../articles";
import { blogMetadata } from "../metadata";

// Keep this route free of loading.tsx and Suspense: a streamed response would
// turn the 404 for archived articles into a 200.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.archived) notFound();

  return blogMetadata({
    title: article.title,
    description: article.copy,
    path: `/blog/${slug}`,
    image: article.image,
    type: "article",
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.archived) notFound();

  const { default: Body } = await import(`@/content/${slug}.mdx`);

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold">{article.title}</h1>
      <time dateTime={article.date} className="mt-2 block text-foreground/70">
        {formatDate(article.date)}
      </time>
      <div className="mt-8 flex flex-col gap-5 text-lg break-words">
        <Body />
      </div>
    </main>
  );
}
