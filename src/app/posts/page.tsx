import { getAllArticles } from "./articles";
import { blogMetadata } from "./metadata";
import PostCard from "./PostCard";

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
          {articles.map((article) => (
            <li key={article.slug}>
              <PostCard article={article} heading="h2" />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
