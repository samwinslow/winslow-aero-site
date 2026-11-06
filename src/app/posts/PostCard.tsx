import Image from "next/image";
import Link from "next/link";
import { formatDate, type Article } from "./articles";

const layouts = {
  // Image beside the text from the sm breakpoint up.
  row: {
    link: "sm:flex-row",
    image: "sm:aspect-auto sm:h-20 sm:w-30",
    sizes: "(min-width: 40rem) 7.5rem, calc(100vw - 5rem)",
  },
  // Image above the text at every width, for the three-column home grid.
  stacked: {
    link: "",
    image: "",
    sizes:
      "(min-width: 72rem) 20rem, (min-width: 48rem) calc(33vw - 3.5rem), calc(100vw - 5rem)",
  },
};

export default function PostCard({
  article: { slug, title, date, copy, image },
  heading: Heading,
  layout = "row",
}: {
  article: Article;
  heading: "h2" | "h3";
  layout?: keyof typeof layouts;
}) {
  const classes = layouts[layout];

  return (
    <Link
      href={`/posts/${slug}`}
      className={`group flex h-full flex-col gap-4 rounded-lg border border-transparent p-4 transition-colors hover:border-foreground/10 hover:bg-foreground/5 ${classes.link}`}
    >
      <div
        className={`relative aspect-[3/2] w-full flex-shrink-0 overflow-hidden rounded-lg bg-foreground/10 ${classes.image}`}
      >
        {image && (
          <Image
            src={image}
            alt=""
            fill
            sizes={classes.sizes}
            className="object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <Heading className="text-xl font-semibold group-hover:underline">
          {title}
        </Heading>
        <time dateTime={date} className="text-foreground/70">
          {formatDate(date)}
        </time>
        <p className="text-lg">{copy}</p>
      </div>
    </Link>
  );
}
