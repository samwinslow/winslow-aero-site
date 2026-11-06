# Codebase Structure

## Directory Layout

```text
.
├── .specs/                  Spec-Driven Development steering and feature specs
├── ideas/                   Post topic ideas, not published
├── public/                  Static files served from the site root
│   ├── blog/                Post images, flat, created with the first image
│   └── stamp/               Favicon and logo sizes
├── src/
│   ├── app/
│   │   ├── layout.tsx       Root layout and site-wide metadata
│   │   ├── page.tsx         Home page
│   │   ├── site-metadata.ts Shared share image and card settings
│   │   ├── about/           /about
│   │   ├── contact/         /contact, with its Tally embed and links
│   │   ├── posts/           /posts index, /posts/[slug], and post helpers
│   │   └── components/      Header, Footer, ContactButton, and icons
│   ├── content/             Post files (.mdx) and authoring rules (README.md)
│   └── mdx-components.tsx   Styling for Markdown elements in posts
├── instrumentation-client.ts  PostHog setup
└── next.config.ts           Next and MDX configuration
```

## Key Patterns

- **Static site:** every page is prerendered at build time.
- **File-based posts:** each `.mdx` file directly in `src/content/` is one post, and its filename is the slug.
- **Two paths for a post:** `src/app/posts/articles.ts` reads and validates frontmatter with `fs`, and `/posts/[slug]` imports the body through `@next/mdx`.
- **Linear file reads:** a post reads only its own file. Only post lists, the index and the home page, read every post, and those reads stop at the end of the frontmatter. `generateStaticParams` lists filenames without opening them. Do not add a module-level memo.
- **Archived posts:** their slugs stay in `generateStaticParams`, and the page calls `notFound()`, so they prerender as 404s.
- **Naming:** the site says "Posts". Code and spec text may still say "article" or "blog", and the image folder is `public/blog/` on purpose.

## Module Boundaries

- `src/content/` holds content only: no code, and no image files.
- Post files import nothing, and the code imports a post body only in `/posts/[slug]/page.tsx`.
- `src/app/posts/page.tsx` uses metadata from `articles.ts` and never imports MDX modules.
- `articles.ts` uses `fs`, so it can only be imported by server code.
- `src/app/components/` must not import from route folders.
- `site-metadata.ts` has no imports, so any page or layout can use it.
- Site navigation lives in the `links` array in `Header.tsx`. Posts are deliberately not in it for now.
