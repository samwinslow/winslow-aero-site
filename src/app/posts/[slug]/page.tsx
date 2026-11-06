import Link from "next/link";
import { notFound } from "next/navigation";
import ContactButton from "../../components/ContactButton";
import { formatDate, getArticle, getArticleSlugs } from "../articles";
import { blogMetadata } from "../metadata";

// Keep this route free of loading.tsx and Suspense: a streamed response would
// turn the 404 for archived articles into a 200.
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.archived) notFound();

  return blogMetadata({
    title: article.title,
    description: article.copy,
    path: `/posts/${slug}`,
    image: article.image,
    type: "article",
  });
}

export default async function ArticlePage({
  params,
}: PageProps<"/posts/[slug]">) {
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
      <div className="post-body mt-8 flex flex-col gap-5 text-lg break-words">
        <Body />
      </div>
      <Link
        href="/posts"
        className="mt-12 inline-block text-lg text-brand-blue hover:underline dark:text-brand-aqua"
      >
        All Posts
      </Link>

      <section className="mt-16 flex flex-col items-start gap-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <p className="text-foreground/70">
          Have a question, a correction, or a story of your own? I&apos;d love
          to hear it.
        </p>
        <ContactButton className="mx-0!">Contact me</ContactButton>
      </section>
    </main>
  );
}
