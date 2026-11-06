# Design: blog

<!-- This file is owned by the design-agent. Do not edit manually during SDD workflow. -->

## Overview

Articles are `.mdx` files in `src/content/`. They reach the site by two separate paths:

1. **Metadata path.** A small server module reads a file with `node:fs`, splits off the YAML block, parses it, and validates it. The index, `generateMetadata`, and the article page read files through this module, `generateStaticParams` only lists filenames through it, and it throws an error naming the file when anything is wrong.
2. **Body path.** `/blog/[slug]` imports the file through `@next/mdx`. `remark-frontmatter` makes the compiler treat the YAML block as frontmatter, so it is not rendered.

`src/mdx-components.tsx` maps Markdown elements to styled elements, including `img` to a plain `<img loading="lazy">`. No custom component is used in articles, and no image work happens at build time.

New code is one route pair, two small helper modules, one MDX mapping file, and one line in the header.

### Evidence labels

Nothing in this document has been executed. There was no shell, and `@next/mdx`, `@mdx-js/*`, `remark-*`, `micromark`, and `mdast-*` are all absent from `node_modules`.

| Label | Meaning |
|---|---|
| **[docs]** | Read in `node_modules/next/dist/docs/` (Next 16.3.6). |
| **[code]** | Read in installed source, not run. |
| **[UNTESTED]** | Could not be tested against the installed compiler or a real build. Where it rests on general knowledge rather than a file read here, it says "recalled". Each one that matters has a step in [Verification Plan](#verification-plan). |

## Architecture

### Components

| Component | Status | Responsibility |
|---|---|---|
| `next.config.ts` | Modified | Wrap config with `createMDX`, set `pageExtensions`, register `remark-frontmatter` by string name. Keep the existing commented `headers` block. |
| `src/mdx-components.tsx` | New | Required by `@next/mdx` in App Router **[docs]**. Maps Markdown elements to classes, and `img` to plain lazy `<img>`. |
| `src/app/blog/articles.ts` | New | Lists, reads, and validates article files. Exports `getArticleSlugs`, `getArticle`, `getAllArticles`, and `formatDate`. |
| `src/app/blog/metadata.ts` | New | `blogMetadata()` builds the full metadata object for both blog pages. |
| `src/app/blog/page.tsx` | New | Index, with empty state. Static. |
| `src/app/blog/[slug]/page.tsx` | New | Article page, `generateStaticParams`, `dynamicParams = false`, `generateMetadata`. |
| `src/app/components/Header.tsx` | Modified | Add `{ href: "/blog", label: "Blog" }` to `links`, between About and Contact. The desktop and mobile navs both map this array **[code]**. |
| `src/content/README.md` | New | Authoring rules. It is the only home for rules the build does not check. It is not `.mdx`, so it is not an article (FR-1) and does not reach the compiler. |
| `src/content/hello-world.mdx` | New | Placeholder article with the required frontmatter and a one-line hello-world body. Published, with no `archived` key (FR-11). |

The helpers live in `src/app/blog/` because the repo colocates route code and has no `src/lib/`. `globals.css`, `layout.tsx`, and `Footer.tsx` are unchanged. `public/blog/` appears when the first image is committed.

### Data Model

There is no database or migration. The only entity is an article, derived from one file:

```ts
type Article = {
  slug: string;       // filename without .mdx
  title: string;
  date: string;       // "YYYY-MM-DD", kept as a string everywhere
  copy: string;
  tags: string[];     // [] when absent; validated, not displayed
  image?: string;
  archived: boolean;  // false when absent
};
```

Example file:

```mdx
---
title: Your first cross-country
date: 2026-03-14
copy: What I wish I had known before planning my first solo cross-country.
tags: [training]
---

Body text.
```

Unknown frontmatter keys are ignored. FR-2 does not prohibit them.

### Interfaces

**`next.config.ts`.** Plugin named by string, as required under Turbopack **[docs]**. The docs permit `next.config.ts` for this **[docs]**, so no rename is needed.

```ts
import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: { remarkPlugins: ["remark-frontmatter"] },
});

export default withMDX(nextConfig);
```

**[UNTESTED]** Whether `@next/mdx`'s TypeScript types accept a string plugin in a `.ts` config. If they do not, use a narrow cast on `options` or follow the docs and rename to `next.config.mjs` (V-0).

**`articles.ts`.**

```ts
export function getArticleSlugs(): string[];                    // readdir only; throws on a bad filename
export function getArticle(slug: string): Article | undefined;  // reads one file; throws if that file is invalid
export function getAllArticles(): Article[];                    // index only; published, sorted; throws on any invalid file
export function formatDate(date: string): string;
```

Reads per build: `generateStaticParams` reads 0 files, each article reads its own file twice (metadata and page), and the index reads N once, so about 3N in a build, plus the compiler reading each `.mdx`. Growth is linear with no per-process state. There are no reads at visitor request time (V-8).

The core of the read:

```ts
import { CORE_SCHEMA, load } from "js-yaml";

const FILENAME = /^[a-z0-9]+(-[a-z0-9]+)*\.mdx$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

// CORE_SCHEMA has no timestamp type, so an unquoted date stays a string.
const data = load(match[1], { schema: CORE_SCHEMA });
```

`getArticleSlugs()` is a `readdir` of `src/content/` and reads no file contents. It is used by `generateStaticParams` and `getAllArticles()`, and behaves as follows:

- Lists the directory non-recursively, and considers only regular files ending in `.mdx` (FR-1).
- Throws on any filename failing `FILENAME`, before reading content.

`getArticle(slug)` reads and validates only `src/content/<slug>.mdx`, and reads no other article file. It is used by `generateMetadata` and the article page, and behaves as follows:

- Returns `undefined` when `<slug>.mdx` fails `FILENAME` or the file does not exist, so nothing outside the `FILENAME` shape reaches `fs`.
- Returns an archived article with `archived: true`. The caller decides what to do with it.
- Throws if `FRONTMATTER` does not match, or if `load` throws. The `load` error is caught and rethrown with the path added.

`getAllArticles()` reads every file, for the index page only. It loops over `getArticleSlugs()` using the same per-file read and validation, then filters archived articles and sorts.

Every error has this form:

```
Invalid article src/content/foo.mdx: date must be a real calendar date in YYYY-MM-DD format
```

Each read stops at its first failure. Reporting all failures at once is not required.

Field rules, hand-written with no schema library:

| Field | Rule | FR |
|---|---|---|
| (block) | Parsed value is a mapping, not null, array, or scalar | FR-4.2 |
| `title` | `typeof === "string"` and non-empty after trim | FR-2.2 |
| `date` | String matching `^\d{4}-\d{2}-\d{2}$`, and `new Date(date + "T00:00:00Z").toISOString().slice(0, 10) === date`, which rejects `2026-02-30` | FR-2.3 |
| `copy` | Same as `title` | FR-2.4 |
| `tags` | If the key is present, an array in which every item is a string | FR-2.5 |
| `image` | If the key is present, a string matching `^/[^/]`. File existence is not checked. | FR-2.6, FR-4.2 |
| `archived` | If the key is present, a boolean. Absent means `false`. | FR-2.7 |

"Present" means the key exists, so `tags:` with an empty value is null and fails.

Sort order: `date` descending, then `slug` ascending. Both use plain `<` string comparison. Zero-padded ISO dates sort chronologically as strings, and plain comparison does not depend on locale.

**`/blog/[slug]/page.tsx`.**

```tsx
export const dynamicParams = false;

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.archived) notFound();
  return blogMetadata({ /* title, copy, /blog/slug, image, "article" */ });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.archived) notFound();
  const { default: Body } = await import(`@/content/${slug}.mdx`);
  // <main className="mx-auto max-w-2xl px-6 py-16"> h1, time, body </main>
}
```

An archived slug is listed in params, so the page runs for it during prerender, and these `notFound()` calls produce its 404. They also give unknown slugs a 404 in `next dev`, where the production fallback check does not apply **[code]**. In production, `fallback: false` answers unknown slugs without running the page, so `articles.ts` is not reached at request time (NFR-6).

**`notFound()` during prerender.** The result is a real 404 **[code]**, with one recalled step noted below. The docs do not cover a `generateStaticParams` path directly. They say only that `notFound()` gives `404` for non-streamed responses and `200` for streamed ones, and that it can be used in `generateMetadata` **[docs]** (`file-conventions/not-found.md:13`, `generate-metadata.md:197`). The trace through installed code:

- Prerender waits for the whole page, so no status is committed early, and the render's catch sets `res.statusCode` to 404 (`server/app-render/app-render.js:5835-5837`, `5893-5895`). That the throw reaches this catch rests on React server rendering not running error boundaries, which is **[UNTESTED]** (recalled).
- `exportAppPage` writes the not-found HTML, plus a `.meta` file with `status: 404` (`export/routes/app-page.js:127-152`). The article body is never imported, because the page throws first.
- `next start` reads that status back and sets it on the response, without running the page (`server/lib/incremental-cache/file-system-cache.js:143,178`, `build/templates/app-page-runtime.js:1211-1213`).
- The slug is listed under `routes` in `prerender-manifest.json` (`build/index.js:2154`). `initialStatus` there stays unset outside Vercel (`export/routes/app-page.js:155`, `server/ci-info.js:39`), so the `.meta` file is the place to check.

V-2 checks the build output and V-7 checks the host. This relies on the status not being streamed **[docs]**, so `/blog` must not gain a `loading.tsx` or a `<Suspense>` around the page. `src/app/` has neither today **[code]**.

**`mdx-components.tsx`.** The exported function takes no arguments **[docs]**. The element map:

| Element | Treatment |
|---|---|
| `h1` to `h6` | Semibold, `1.875 / 1.625 / 1.4375 / 1.3125 / 1.25 / 1.1875rem`. All exceed the `text-lg` body (1.125rem) and strictly descend. |
| `a` | `underline text-brand-blue dark:text-brand-aqua`. Plain `<a>`, not `next/link`. |
| `ul`, `ol` | `list-disc` / `list-decimal` with `pl-5`, as on `/about`. Preflight removes markers **[code]**. |
| `blockquote` | `border-l-4 border-foreground/20 pl-4` |
| `code` | `rounded bg-foreground/10 px-1 py-0.5 text-[0.9em]` |
| `pre` | `overflow-x-auto rounded-lg bg-foreground/10 p-4 text-sm`, resetting nested `code` with `[&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]` |
| `hr` | `border-foreground/20` |
| `img` | See below |

Paragraphs, `em`, and `strong` take browser and Preflight defaults. The body wrapper is `flex flex-col gap-5 text-lg break-words`, following the `flex-col` pattern of `/about`. `break-words` stops long URLs from overflowing (NFR-3).

The `img` mapping, where the exact form matters:

```tsx
img: ({ alt, ...props }) => (
  // Plain img by design. Article images have no dimensions; see design.md.
  // eslint-disable-next-line @next/next/no-img-element
  <img {...props} alt={alt ?? ""} loading="lazy" className="max-w-full h-auto rounded-lg" />
),
```

`loading` comes after the spread so it always wins. `alt` is passed explicitly so `jsx-a11y/alt-text` can see it. `@next/next/no-img-element` is only `warn` **[code]**, so it would not fail `eslint`, but the disable comment keeps the output clean.

**`metadata.ts`.** Because of the shallow merge, the helper states every field. Used by both blog pages:

```ts
const DEFAULT_IMAGE = "/og-image-wtext.jpg";

export function blogMetadata({ title, description, path, image = DEFAULT_IMAGE, type }) {
  const fullTitle = `${title} | winslow.aero`;
  return {
    title,                     // root template turns this into "<title> | winslow.aero"
    description,
    openGraph: { title: fullTitle, description, url: path, siteName: "winslow.aero",
                 type, images: [image] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}
```

- The index calls it with `title: "Blog"`, a blog-specific description, `path: "/blog"`, and `type: "website"`. FR-8.8 requires less than this, but stating only the required fields would drop the share image for `/blog`, since `openGraph` and `twitter` are replaced whole.
- The default image path is duplicated from `layout.tsx`. It is a single short string, and sharing it would mean changing `layout.tsx`, which this design otherwise leaves alone.

## Resolved Questions

### Q1: Reading and stripping frontmatter under Turbopack

- `@next/mdx` has no frontmatter support by default **[docs]**.
- Under Turbopack, plugins are named by string, and plugins without serializable options cannot be used **[docs]**. `'remark-frontmatter'` as a bare string is the documented "without options" form **[docs]**.
- `remark-frontmatter` is one of the three approaches the docs name **[docs]**.
- **Stripping:** `remark-frontmatter` adds parser support for the block, producing a `yaml` node that the HTML step drops. **[UNTESTED]** (recalled; V-1, V-2.)
- **Reading:** the plugin does not expose values, and it does not need to. `articles.ts` reads the raw file with `fs`, which the docs describe for building a blog index **[docs]**, and parses the block with `js-yaml`.

The splitter regex and `remark-frontmatter` both have to recognize the block. The regex is strict: `---` alone on line 1, closing `---` alone on a line. A file the regex rejects fails the build, so disagreement can only be a visible error, except for a block the regex accepts and the plugin does not. V-2 covers the standard shape.

### Q2: Index metadata

`/blog` calls `getAllArticles()`. It does not import MDX modules, so the index needs no compiled article output. Archived articles are filtered in `getAllArticles()`, and sorting follows the rule above. The page is static and contains no request-time API, so it changes only on rebuild (FR-5.4).

### Q3: Build failure and the empty case

**Failing the build (FR-1.2, FR-4.2, FR-4.3).** Validation runs when a directory is listed or a file is read, so the two kinds of failure surface at different points.

**Bad filename.** `getArticleSlugs()` throws inside `generateStaticParams`.

- `generateStaticParams` runs before pages are generated **[docs]**.
- `buildAppStaticPaths` has no `try/catch` **[code]** (`build/static-paths/app.js`), so a throw reaches `isPageStatic`, which does `console.error(err)` and rethrows `Failed to collect page data for /blog/[slug]` **[code]** (`build/utils.js:827-837`). The custom message naming the file is therefore printed in the build output.
- The non-zero exit code is **[UNTESTED]** (V-3).

**Invalid frontmatter.** The build fails when that article's page or the index is rendered, not in `generateStaticParams`, which reads no contents.

- `getArticle()` throws in the article's `generateMetadata` and page, and `getAllArticles()` throws in `/blog`, so there are two independent triggers.
- The error handler records the original error, and the render rethrows it (`server/app-render/create-error-handler.js:102-108`, `server/app-render/app-render.js:1643-1646`). `exportAppPage` passes it on (`export/routes/app-page.js:168-171`).
- `exportPage` prints `Error occurred prerendering page "<path>"`, then does `console.error(err)`, and the prerender process's stderr is piped to the parent (`export/worker.js:385-399`, `lib/worker.js:157-158`). The custom message naming the file is therefore printed in the build output **[code]**.
- `prerenderEarlyExit` defaults to `true`, so the prerender process exits with code 1 and the parent exits with that code **[code]** (`server/config-shared.js:199`, `export/worker.js:314-316`, `lib/worker.js:125-130`).
- None of this has been run. V-3 confirms the message and the exit code.

**Compile failure (FR-4.1).** A body that cannot be compiled fails the build for the article being built, through the template import. **[UNTESTED]** (recalled; V-4.)

**Zero published articles (FR-6.6).** `/blog` shows the empty-state message when `getAllArticles()` returns nothing. If every file is archived, `generateStaticParams` still lists those slugs, and each one prerenders as a 404. If there are no `.mdx` files, it returns `[]`, which is legal with Cache Components off **[docs]**.

**Do not enable Cache Components.** It makes `dynamicParams` a build error and makes an empty `generateStaticParams` a build error **[docs]**.

### Q4: OQ-12 and FR-4.5, compiler behavior

**Not confirmed.** No MDX compiler is installed, and the bundled docs do not cover these differences, so every row below is **[UNTESTED]** (recalled). FR-4.5 and OQ-12 say the design phase confirms this, which is not possible without installing packages. Confirmation moves to V-1, the first step after install. It runs the real compiler over every row, and the table is updated from the results.

| Input in body | Expected with `@next/mdx`, no GFM | Build detects? |
|---|---|---|
| Unescaped `<` in prose | Compile error, parsed as JSX start | Yes, FR-4.1 |
| Unescaped `{` with invalid or unclosed expression | Compile error | Yes, FR-4.1 |
| Valid expression, e.g. `{2}` | Compiles, renders value | No (FR-4.5) |
| HTML comment | Compile error | Yes, FR-4.1 |
| Raw HTML, balanced, e.g. `<div>x</div>`, `<br />` | Compiles as JSX, renders the element | No |
| Raw HTML, unclosed, e.g. `<br>` | Compile error | Yes, FR-4.1 |
| Indented code block | Compiles, renders as a paragraph | No (FR-4.5) |
| Autolink `<https://example.com>` | Compile error | Yes, FR-4.1 |
| `export const x = 1` | Compiles, export is unused | No |
| `import` of a resolvable module | Compiles | No |
| `import` of a missing module | Build error from the bundler | Yes |
| Malformed `import` or `export` | Compile error | Yes, FR-4.1 |
| Undefined JSX component, e.g. `<Image />` | Compiles, throws at render because the component is not provided | Yes, fails at prerender |
| GFM table | Compiles, renders as plain text | No (FR-4.5) |

The table does not conflict with any requirement. All cases are either build failures or remain authoring rules under FR-4.5. If V-1 contradicts an FR-4.5 bullet, that is a requirements change, and it gets routed back rather than absorbed here.

`experimental.mdxRs` exists **[docs, code]** but is experimental, and it is not enabled. All expectations above assume the JavaScript `@mdx-js` compiler.

### Q5: OQ-13, images

Resolved: article images render as plain `<img>` through the `img` mapping, never `next/image`. The docs' `img` example passes no dimensions to `next/image` **[docs]**, so it cannot be copied. The mapping itself is documented **[docs]**, and it applying to Markdown `![alt](path)` output is **[UNTESTED]** (V-2).

| FR | How it is met with no article change |
|---|---|
| FR-10.1 | The compiler passes `alt` and `src` to the mapped `img`. |
| FR-10.2 | `max-w-full`, also set by Preflight **[code]** (`preflight.css:232`). The body column is the containing block. |
| FR-10.3 | `h-auto`, also set by Preflight **[code]** (`preflight.css:233`). No dimensions are set. |
| FR-10.4 | `loading="lazy"` after the prop spread. |
| FR-10.5 | No optimizer in the path. `public/` files are served directly. |

`/blog/photo.jpg` cannot collide with an article: filename slugs cannot contain a dot, and `public/` is checked before dynamic routes **[docs]** (`rewrites.md`).

### Q6: Date handling

js-yaml's default schema turns an unquoted `2026-03-14` into a `Date` at UTC midnight **[code]** (`timestamp.js:44-45`). Local formatting on a machine west of UTC would then show March 13.

The design avoids this by never creating a date from YAML. `CORE_SCHEMA` is the JSON schema, with only null, bool, int, and float implicit types, and no timestamp **[code]** (`schema/core.js`, `schema/json.js`). The value stays a string, quoted or not.

If that reading is wrong, the value would not be a string, and the `date` rule would fail the build loudly. It could not show a wrong date silently. Confirmed by V-2.

`formatDate` pins UTC on both ends, so the build machine's zone has no effect:

```ts
new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" })
  .format(new Date(`${date}T00:00:00Z`));   // "March 14, 2026"
```

Pages are prerendered, so the reader's time zone never applies. Markup is `<time dateTime={date}>`.

### Q7: Metadata

- Metadata objects merge shallowly, so a page's `openGraph` replaces the root's entirely **[docs]**. `blogMetadata()` states every field.
- `title` goes through the root template **[docs, code]**. The template does not apply to `og:title`: the OG template comes from the root's `openGraph.title.template` **[code]** (`resolve-metadata.js:807`), and the root's value there is a plain string. Hence the explicit `fullTitle`, which is also what `/about` does.
- `metadataBase` is inherited from the root layout and applies to relative URL fields below it **[docs]**. The design passes relative paths and leaves `layout.tsx` alone.
- `openGraph.images` and `twitter.images` accept strings **[code]** (type definitions).

OQ-10 remains a user action: if `DEPLOY_PRIME_URL` is set in production, `og:url` and `og:image` use that host.

## Requirement Traceability

The requirements have no FR-3.3; numbering goes from FR-3.2 to FR-3.4. Nothing is orphaned by this.

"Authoring rule" means no component enforces it, and it is documented in `src/content/README.md`.

| Requirement | Component(s) | Notes |
|---|---|---|
| FR-1 | `articles.ts` | Non-recursive listing of `.mdx` regular files |
| FR-1.1 | `articles.ts` | Slug is filename minus extension |
| FR-1.2 | `articles.ts` | `FILENAME` check in `getArticleSlugs()`, throws |
| FR-2 | `articles.ts` | `FRONTMATTER` regex |
| FR-2.1 | `articles.ts` | Only YAML is read. MDX exports are never used. |
| FR-2.2 to FR-2.4 | `articles.ts` | Field rules |
| FR-2.5 | `articles.ts` | Validated, stored in `tags`, not rendered |
| FR-2.6 | `articles.ts`, `metadata.ts` | Validated; used only for metadata |
| FR-2.7 | `articles.ts` | Defaults to `false` |
| FR-2.8 | `next.config.ts` (`remark-frontmatter`) | **[UNTESTED]**, V-2 |
| FR-3 | `README.md` | Authoring rule; intro to the subset |
| FR-3.1 | `@next/mdx`, `mdx-components.tsx` | No GFM plugin added. **[UNTESTED]**, V-2 |
| FR-3.2 | `README.md` | Authoring rule; violations partly caught by FR-4.1, see Q4 |
| FR-3.4 | `README.md` | Authoring rule; not checked (FR-4.5) |
| FR-3.5 | `mdx-components.tsx` | Maps standard elements only; articles import nothing |
| FR-4.1 | `[slug]/page.tsx`, Turbopack | Compile failure surfaces through the template import. **[UNTESTED]**, V-4 |
| FR-4.2 | `articles.ts` | Field rules and parse errors |
| FR-4.3 | `articles.ts` | Error names the file; `console.error` path **[code]**. FR-4.1 naming is whatever `next build` does; no tooling added. |
| FR-4.5 | Whole design, `README.md` | No lint or scan added. Confirmation deferred to V-1. |
| FR-5 | `articles.ts`, `[slug]/page.tsx` | `getAllArticles()` keeps `archived === false`; the article page treats `archived: true` as not found |
| FR-5.1 | `[slug]/page.tsx` | `generateStaticParams` lists every slug; the page renders each published article |
| FR-5.2, FR-5.3 | `[slug]/page.tsx` | Archived: slug is in params, and `notFound()` prerenders a 404 **[code]**, V-2, V-7. Unknown: `dynamicParams = false`, plus `notFound()` in `next dev`. |
| FR-5.4 | `[slug]/page.tsx`, `blog/page.tsx` | Static only; no revalidation |
| FR-6 | `blog/page.tsx` | Route |
| FR-6.1 to FR-6.3 | `articles.ts` | Filter and sort |
| FR-6.4, FR-6.5 | `blog/page.tsx` | Entry with `next/link` |
| FR-6.6 | `blog/page.tsx`, `[slug]/page.tsx` | Empty-state message, see Q3. Normal check only; no dedicated verification step. |
| FR-7.1, FR-7.2, FR-7.4 | `[slug]/page.tsx` | Same `h1` classes as `/about` |
| FR-7.3 | `articles.ts` | String date, `formatDate` |
| FR-7.5 | `mdx-components.tsx` | Element map |
| FR-7.6 | `blog/page.tsx`, `[slug]/page.tsx` | Root layout chrome; `max-w-2xl` is 42rem **[code]** |
| FR-7.7 | `mdx-components.tsx` | Plain `h1` mapping, no special handling |
| FR-8 | `metadata.ts` | States every field |
| FR-8.1 to FR-8.7 | `metadata.ts`, `[slug]/page.tsx` | See Q7 |
| FR-8.8 | `metadata.ts`, `blog/page.tsx` | Blog description |
| FR-9, FR-9.1, FR-9.2 | `Header.tsx` | Single `links` array feeds both navs |
| FR-10 | `mdx-components.tsx`, `README.md` | Standard Markdown images; broken images outside the site are accepted |
| FR-10.1 to FR-10.5 | `mdx-components.tsx` | See Q5 |
| FR-10.6, FR-10.8 to FR-10.10 | `README.md` | Authoring rules, not checked |
| FR-10.7 | `README.md` | Authoring rule; not checked (FR-4.5 allows no scan) |
| FR-11 | `src/content/hello-world.mdx` | Published placeholder with required frontmatter and a one-line body |
| NFR-1 | `next.config.ts`, `mdx-components.tsx` | No plugin that alters structure; `img` mapping keeps elements. **[UNTESTED]**, V-1, V-2 |
| NFR-2.1, NFR-2.2 | `next.config.ts` | `@next/mdx`; `build` script unchanged |
| NFR-2.3 | All | Lint disable on `img`; V-2 runs both |
| NFR-3 | `mdx-components.tsx`, page wrappers | `max-w-full`, `overflow-x-auto`, `break-words` |
| NFR-4 | `mdx-components.tsx` | See Risks for contrast values |
| NFR-5 | None | Author's responsibility; no component by design |
| NFR-6 | `articles.ts`, `[slug]/page.tsx`, `blog/page.tsx` | Metadata and page read only their own file through `getArticle()`; `generateStaticParams` reads none; only `/blog` reads all, through `getAllArticles()`. About 3N reads per build, linear, V-8. No reads per request; see Sequence Flows and the host-404 risk. |
| OQ-10 | None | User action; `metadataBase` reused unchanged |
| OQ-12 | V-1 | Deferred; see Q4 |
| OQ-13 | `mdx-components.tsx` | Resolved; see Q5 |

## Sequence Flows

**Build, normal case.**

1. Turbopack compiles the route.
2. Page data collection calls `generateStaticParams`, which lists `src/content/`, checks filenames, and returns every slug, archived included. It reads no article contents.
3. Prerender calls `/blog/page.tsx`, which reads and validates all files through `getAllArticles()` and lists published articles.
4. For each slug, `generateMetadata` and `Page` run, and each reads and validates only that article's file. A published article's MDX module renders through `useMDXComponents`. An archived article calls `notFound()` and is stored as a 404.
5. HTML is written. `src/content/` is not needed after this.

**Build, invalid file.** For a bad filename, step 2 throws. Next prints the error naming the file, then fails with `Failed to collect page data`. For invalid frontmatter, step 3 or step 4 throws. Next prints `Error occurred prerendering page`, then the error naming the file, then exits non-zero (see Q3).

**Request.**

- `/blog` and `/blog/<published>` are served as prerendered.
- `/blog/<archived>` is also prerendered, and is served as the not-found page with its stored 404 status.
- `/blog/<unknown>` is not prerendered, so it gets a 404 from `fallback: false`.
- `/blog/photo.jpg` is served from `public/`.

Prerendered pages and `fallback: false` paths do no article reads, and `articles.ts` must not be reached at request time in production (NFR-6).

**Publish.** Commit the file and deploy.

## Dependencies

| Package | Kind | Why | Status |
|---|---|---|---|
| `@next/mdx` | runtime dep | NFR-2.1. Pin to `16.3.6` to match `next`. | Named in docs. Version pairing is **[UNTESTED]** (recalled). |
| `@mdx-js/loader`, `@mdx-js/react` | runtime deps | The docs' install list **[docs]**. | Named in docs. Whether `@mdx-js/react` is strictly needed is unverified; keeping the documented set is simpler than testing its removal. |
| `@types/mdx` | dev dep | `MDXComponents` type **[docs]**. | Named in docs. |
| `remark-frontmatter` | runtime dep | Stops the block rendering (FR-2.8). No alternative within constraints. | Named in docs. Version and Turbopack compatibility **[UNTESTED]**. V-2. |
| `js-yaml` | runtime dep | Parses frontmatter. Already in the lockfile at 4.3.2 through `@eslint/eslintrc` **[code]**, so it adds a direct entry and no new download. Must be declared, because relying on a transitive package is fragile. | API read in 4.3.2 **[code]**. Bundling under Turbopack **[UNTESTED]**. V-2. |
| `@types/js-yaml` | dev dep | js-yaml ships no `.d.ts` **[code]**, and this package is not installed. | Version match with 4.3.2 **[UNTESTED]**. |

Rejected to keep dependencies down: `gray-matter`, `remark-mdx-frontmatter`, `@tailwindcss/typography`, `zod`, `remark-gfm`.

No new tooling for tests. See D-7.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| String plugin loading or `remark-frontmatter` behaves differently than recalled. | V-0 reads the installed `@next/mdx`. V-2 proves stripping end to end. If it fails, this design must be revisited before further tasks, so V-0 to V-2 come first. |
| The `fs` read adds `src/content/` tracing noise or warnings in the build. | Check V-2 output. Pages are prerendered, so the deployed function does not need these files. |
| 404 on the host differs from `next start`. **[UNTESTED]** | An archived slug is a prerendered page whose 404 status is stored in its `.meta` file, so a host that ignores that file would answer 200 with the not-found page, not the article. An unknown slug relies on `fallback: false`. `notFound()` in the page is the backstop for both. If that backstop were reached on a host, it would call into `articles.ts` at request time, contrary to NFR-6. If `src/content/` does not exist in the deployed function, `getArticle` returns `undefined` and the answer is still 404. V-7 confirms the host returns 404 for these paths. |
| Link contrast. | Brand blue fails on dark (1.9:1) and brand aqua fails on white (3.7:1), so each is used in only one scheme. See below. |
| Footer contrast in dark mode (existing). `text-black/60` on `#0a0a0a` is near-invisible, about 1.05:1. | Footer is site chrome, not page body text, and is out of NFR-4's scope as read here. Left unchanged and flagged for the user. |

Contrast values, computed by hand from the WCAG formula:

| Text | On | Ratio |
|---|---|---|
| `#171717` body | `#ffffff` | Well above 4.5:1 |
| `#ededed` body | `#0a0a0a` | Well above 4.5:1 |
| Links, brand blue | `#ffffff` | 10.4:1 |
| Links, brand aqua | `#0a0a0a` | 5.3:1 |
| Date, `text-foreground/70` | light / dark | 6.6:1 / 8.4:1 |
| Code on `bg-foreground/10` | light / dark | 14.6:1 / 13.8:1 |

The site follows `prefers-color-scheme` **[code]**, and Tailwind's default `dark:` variant is expected to match it. **[UNTESTED]** (recalled; V-6.)

## Verification Plan

Run these after install, before other implementation tasks where marked. Fixtures are temporary and are removed after each step. Per project convention, nothing here uses the dev server.

| Step | Action | Confirms |
|---|---|---|
| **V-0** (first) | Read the installed `@next/mdx` source: Turbopack rule, string plugin resolution, types. | Q1 assumptions; config form |
| **V-1** (first) | Throwaway script in a scratch directory, not the repo. Run `compile` or `evaluate` from `@mdx-js/mdx` with `remark-frontmatter` over each row of the Q4 table, and record pass/fail and output. Update Q4 from the results. | OQ-12, FR-4.5, NFR-1 |
| **V-2** (first) | Add one published fixture exercising all of FR-3.1 and an image, one archived fixture to check FR-5 (not listed, 404 path), and temporary published fixtures with different dates and two sharing a date. Run `next build`, `eslint`, `tsc --noEmit`. Inspect `.next/server/app/blog/*.html`: no frontmatter text, `loading="lazy"` on a plain `img`, correct date and meta tags. Inspect the prerendered `/blog` index HTML: entries ordered by date descending, and same-date entries by slug ascending (FR-6.2, FR-6.3). Inspect the prerendered home or `/blog` index HTML: the header has a `/blog` link (FR-9, FR-9.1). The mobile menu is not in the initial HTML, so confirm FR-9.2 by code review of the shared `links` array. Inspect `.next/prerender-manifest.json`: archived slug listed under `routes`, `/blog/[slug]` has `fallback: false`. Inspect the archived slug's `.meta` file beside its `.html`: `status` is 404, and the `.html` contains no article text. Check build output for warnings. | FR-2.8, FR-3.1, FR-5.x, FR-6.2, FR-6.3, FR-7.x, FR-8.x, FR-9, FR-9.1, FR-9.2, FR-10.x, NFR-2.x |
| **V-3** | One build per defect: bad filename, no frontmatter, invalid YAML, and each field rule. Each must exit non-zero with the filename in the output. | FR-1.2, FR-4.2, FR-4.3 |
| **V-4** | Fixture with a body compile error. Build must fail. | FR-4.1 |
| **V-6** | Rebuild V-2 with `TZ=Pacific/Pago_Pago` and `TZ=Pacific/Kiritimati`, and compare dates. User-performed manual step after deploy, alongside V-7: on a deploy preview, check widths 320 to 1440 in both color schemes. No agent or task performs or waits on this manual step, and it blocks nothing. | FR-7.3, NFR-3, NFR-4 |
| **V-7** | User-performed manual step after deploy: request an archived slug and an unknown slug, and confirm HTTP 404. No agent or task performs or waits on this step, and it does not block implementation. | FR-5.2, FR-5.3 |
| **V-8** | Verified by code review, because a build-level read count would need extra tooling. `generateStaticParams` uses only `readdir`, `getArticle` opens one file, and `getAllArticles` is called only from `src/app/blog/page.tsx`. | NFR-6 |

## Design Decisions

**D-1: `remark-frontmatter` plus `fs` plus `js-yaml`.** One plugin strips, one parser reads.
- `remark-mdx-frontmatter` would add a dependency, require importing every module to build the index, and bring its own YAML date handling.
- `gray-matter` still needs `remark-frontmatter` for stripping, so it would be a duplicate parser.
- A local remark plugin cannot help: without the syntax extension the block has already been parsed as a thematic break and heading text. **[UNTESTED]** (recalled.)

**D-2: Validate at read time, not in a prebuild script or `next.config.ts`.** It runs on every `next build`, needs no script change (NFR-2.2), and shares code with the pages.

**D-3: Hand-written validation.** There are seven simple rules, and `zod` is only a transitive dependency.

**D-4: Style through `mdx-components.tsx`.** `img` needs the mapping anyway for lazy loading, and one file then covers all of FR-7.5 with no new dependency. `@tailwindcss/typography` is the docs' suggestion **[docs]**, but it adds a dependency and its defaults would need overriding for the size and contrast rules.

**D-5: Long date format.** `March 14, 2026` reads better than ISO. Displaying the raw string would remove `formatDate` entirely and is an equally valid reading of FR-7.3. Easy to change.

**D-6: JavaScript MDX compiler, not `mdxRs`.** The docs call it experimental and not recommended for production **[docs]**.

**D-7: No test runner.** `package.json` has none, and neither does the repo. This design adds none. Verification is the build matrix above, so V-3 is manual. A unit test of the validator would be the natural first test if a runner is wanted, but that is a separate choice.

**D-8: `blogMetadata()` used on the index too.** See Interfaces. This is the shortest way to avoid the shallow-merge losses, not extra scope.

**D-9: No caching.** Per the user's direction, each article reads only its own file, and only the index reads all. The user rejected a module-level memo. Reads stay linear without one, which also removes any need for React `cache()`.
