import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactButton from "./components/ContactButton";
import { getLatestArticles } from "./posts/articles";
import PostCard, { PostCardSkeleton } from "./posts/PostCard";

const SHOW_POST_LIST = true;
const LATEST_POST_COUNT = 3;

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  const latestArticles = SHOW_POST_LIST
    ? getLatestArticles(LATEST_POST_COUNT)
    : [];
  const skeletonCount = LATEST_POST_COUNT - latestArticles.length;

  return (
    <main>
      <section
        className="relative flex h-[85vw] min-h-[320px] items-center justify-center overflow-hidden bg-scroll bg-cover bg-center text-center sm:h-[42vh] sm:bg-fixed"
        style={{ backgroundImage: "url('/IMG_0303.jpeg')" }}
      >
        <div className="absolute inset-0 bg-[hsla(214,81%,20%,0.5)]" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-white">
          <h1 className="text-5xl font-medium tracking-tight">winslow<span className="opacity-75">.aero</span></h1>
          <h2 className="text-xl font-semibold tracking-tight">Flying and Software Services in the SF Bay Area</h2>
          <ContactButton />
        </div>
      </section>

      <section className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-10 text-center sm:flex-row sm:text-left">
        <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full bg-black/10">
          <Image
            src="/av_headshot.jpeg"
            alt="Sam Winslow"
            fill
            sizes="10rem"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-black/70">
            I am a software engineer turned pilot based in the San Francisco Bay Area. Not content to be a passenger in my own life, I&rsquo;ve built and scaled several early-stage startup companies, and began pursuing flight training in 2022.
          </p>
          <p className="text-black/70">
            I hold Commercial Pilot (single and multiengine land), and Ground Instructor certificates. Aviation was a first love for me, and I hope to inform and inspire you too!
          </p>
          <p className="text-black/70">
            &mdash; Sam Winslow
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6 bg-brand-aqua/5 px-6 py-10">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <h2 className="text-center text-3xl font-semibold">Instructional Videos</h2>
          <p className="text-center text-black/70">
            Check out the{" "}
            <a
              href="https://www.youtube.com/playlist?list=PLC7vHIXQ81Ng"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              full playlist
            </a>
            . A great supplement, but not a
            substitute for hands-on flight instruction. New video roughly once per week!
          </p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              src="https://www.youtube.com/embed/videoseries?si=xUtB0NywcNbje1Nt&list=PLC7vHIXQ81Ng"
              title="YouTube video player"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {latestArticles.length > 0 && (
        <section className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex items-center justify-between gap-4 px-4">
            <h2 className="text-3xl font-semibold">
              <Link href="/posts">Latest Posts</Link>
            </h2>
            <Link
              href="/posts"
              className="text-brand-blue hover:underline dark:text-brand-aqua"
            >
              See all
            </Link>
          </div>
          <ul className="grid gap-4 md:grid-cols-3">
            {latestArticles.map((article) => (
              <li key={article.slug}>
                <PostCard article={article} heading="h3" layout="stacked" />
              </li>
            ))}
            {Array.from({ length: skeletonCount }, (_, index) => (
              <li key={index} className="hidden md:block">
                <PostCardSkeleton />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bg-brand-aqua/5 px-6 py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-medium">
            Looking for a pilot, web dev, or ground instructor?<br />
            Let&rsquo;s connect.
          </h2>
          <ContactButton>Contact me</ContactButton>
        </div>
      </section>
    </main>
  );
}
