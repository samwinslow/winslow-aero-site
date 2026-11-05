# Requirements: Blog

<!-- This file is owned by the requirements-agent. Do not edit manually during SDD workflow. -->

## Overview

winslow.aero gains a blog of articles for pilots and people interested in flying, on topics such as training, gear, skills, destinations, community, and ownership. Articles are `.mdx` files in git, written so that each file is also ordinary Markdown, and every published article is prerendered at build time. Publishing means committing a file and deploying; there is no CMS or runtime content layer.

## Functional Requirements

### FR-1: Article Files

The system shall treat each `.mdx` file located directly in `src/content/` as one article.

#### FR-1.1: Slug

The system shall use the article's filename, without the `.mdx` extension, as its URL slug.

#### FR-1.2: Invalid Filename

If an article's filename does not match `^[a-z0-9]+(-[a-z0-9]+)*\.mdx$`, the system shall fail the build.

### FR-2: Frontmatter

Each article file shall begin with a standard YAML frontmatter block delimited by `---` lines.

#### FR-2.1: Metadata Source

The system shall read article metadata only from the frontmatter block, and not from an ES `export` in the article file.

#### FR-2.2: Title

The frontmatter shall contain `title`, a non-empty string.

#### FR-2.3: Date

The frontmatter shall contain `date`, a valid calendar date in `YYYY-MM-DD` format. This strict format is accepted.

#### FR-2.4: Copy

The frontmatter shall contain `copy`, a non-empty string that serves as the article's description and summary.

#### FR-2.5: Tags

Where `tags` is present, its value shall be a list of strings. Tags are stored and validated but are not displayed in v1.

#### FR-2.6: Image

Where `image` is present, its value shall be a string containing a root-relative path beginning with a single `/`, such as `/blog/photo.jpg` or `/og-image.jpg`. The image is used for social sharing only (FR-8.5) and is not displayed on the index or article pages.

#### FR-2.7: Archived

Where `archived` is present, its value shall be a boolean. When it is absent, the system shall treat the article as `archived: false`.

#### FR-2.8: Frontmatter Not Rendered

The system shall not render any part of the frontmatter block as article body content.

### FR-3: Portable Markdown Subset

Article bodies shall be written in the subset of syntax that CommonMark and MDX interpret the same way. MDX is not a strict superset of Markdown, so the rules below apply to every article.

#### FR-3.1: Supported Syntax

The system shall render each of the following constructs as its corresponding HTML element: headings of level 1 to 6 (`#` to `######`), paragraphs, emphasis, strong emphasis, ordered lists, unordered lists, blockquotes, inline code, fenced code blocks, thematic breaks, inline links (`[text](url)`), and images (`![alt](path)`).

This list is CommonMark only: GitHub Flavored Markdown syntax is not supported, and bare URLs do not become links.

#### FR-3.2: Excluded Syntax

Article bodies shall not contain any of the following constructs:

| Excluded construct | Portable alternative |
| --- | --- |
| Unescaped `<` in prose | `\<`, or inline code |
| Unescaped `{` in prose | `\{`, or inline code |
| HTML comments (`<!-- -->`) | Remove; no portable equivalent |
| Raw HTML tags | Markdown syntax; no portable equivalent otherwise |
| Indented code blocks | Fenced code blocks |
| Autolinks (`<https://example.com>`) | Inline links |
| ES `import` or `export` statements | Frontmatter for metadata |
| JSX, including `<Image />` | `![alt](path)` for images |
| GFM tables | Lists or paragraphs |

#### FR-3.4: Image Alt Text

Every image in an article body shall have non-empty alt text.

#### FR-3.5: No Article-Specific Components

The system shall not require any MDX component in an article file in order to render that article.

### FR-4: Build Validation

#### FR-4.1: Compile Failure

If an article body cannot be compiled, the system shall fail the build with a non-zero exit code.

#### FR-4.2: Frontmatter Failure

If an article's frontmatter is missing, is not valid YAML, or violates any of FR-2.2 through FR-2.7, the system shall fail the build with a non-zero exit code. For FR-2.6, the build checks only that the value is a root-relative path string, not that the file exists.

#### FR-4.3: Failure Message

When the build fails under FR-1.2 or FR-4.2, the system shall name the offending file in the build output. When the build fails under FR-4.1, the build output shall name the offending file only if `next build` already does so; no custom tooling shall be added for this.

#### FR-4.5: Limits of Build Validation

The system shall perform no lint step or content scan beyond FR-1.2, FR-4.1, and FR-4.2. This is a decision for v1. The following cases are not detected by the build and remain authoring rules:

- An indented code block, which is expected to compile and render as a paragraph.
- A valid expression such as `{2}`, which is expected to compile and render as its value.
- A GFM table, which is expected to compile and render as plain text.
- A missing image file.
- Empty image alt text (FR-3.4).

`@next/mdx` is not installed yet, so this expected compiler behavior has not been tested. The design phase shall confirm it, and shall confirm how raw HTML, JSX, and `import` or `export` statements behave.

### FR-5: Publication

An article is published when its `archived` value is `false`.

#### FR-5.1: Prerendering

When the site is built, the system shall prerender a page at `/blog/<slug>` for every published article.

#### FR-5.2: Archived Articles Not Served

When `/blog/<slug>` is requested for an archived article, the system shall respond with HTTP 404.

#### FR-5.3: Unknown Slugs

When `/blog/<slug>` is requested for a slug with no article file, the system shall respond with HTTP 404.

#### FR-5.4: Build-Time Content Only

While the site is deployed, the system shall serve only the articles present at build time. Adding or changing an article file shall have no effect on the site until the next build and deploy.

### FR-6: Blog Index

The system shall serve an index page at `/blog`.

#### FR-6.1: Listing

The index shall list every published article and no archived article.

#### FR-6.2: Ordering

The index shall order articles by `date`, newest first.

#### FR-6.3: Tie-Break

Where two articles have the same `date`, the index shall order them by slug, ascending.

#### FR-6.4: Entry Content

Each index entry shall show the article's `title`, `date`, and `copy`.

#### FR-6.5: Entry Link

Each index entry shall link to the article at `/blog/<slug>`.

#### FR-6.6: Empty State

While there are no published articles, the index shall display a message stating that there are no articles yet, and the build shall succeed.

### FR-7: Article Page

#### FR-7.1: Title

The article page shall render `title` as a level 1 heading.

#### FR-7.2: Date

The article page shall display `date`.

#### FR-7.3: Date Accuracy

The system shall display the same calendar date written in the frontmatter, regardless of the time zone of the build machine or the reader.

#### FR-7.4: Body

The article page shall render the article body below the title and date.

#### FR-7.5: Element Styling

The system shall give each element in FR-3.1 a visible style: headings of level 1 to 6 larger than body text and descending in size by level, lists with visible markers, links visually distinct from body text, blockquotes and code visually distinct from paragraphs.

#### FR-7.6: Site Consistency

The index and article pages shall render inside the existing site header and footer, use the site font, and use the same maximum content width as `/about` (42rem).

#### FR-7.7: Level 1 Headings in the Body

The system shall render a level 1 heading in an article body as an `h1` element in its place in the body, after the title, with no special handling, detection, or de-duplication.

### FR-8: Page Metadata

Metadata from a page replaces the root layout's `openGraph` and `twitter` objects entirely rather than merging with them, so article pages must state every field below themselves.

#### FR-8.1: Document Title

The article page's `<title>` shall be `<title> | winslow.aero`, using the existing root title template.

#### FR-8.2: Description

The article page's meta description shall equal `copy`.

#### FR-8.3: Open Graph Text

The article page's `og:title` shall be `<title> | winslow.aero`, its `og:description` shall equal `copy`, and its `og:site_name` shall be `winslow.aero`.

#### FR-8.4: Open Graph Type and URL

The article page's `og:type` shall be `article`, and its `og:url` shall be `/blog/<slug>` resolved against the existing `metadataBase`.

#### FR-8.5: Article Image

Where `image` is present, the article page's `og:image` and `twitter:image` shall be that image resolved against the existing `metadataBase`.

#### FR-8.6: Default Image

Where `image` is absent, the article page's `og:image` and `twitter:image` shall be the site default, `/og-image-wtext.jpg`, resolved against the existing `metadataBase`.

#### FR-8.7: Twitter Card

The article page's `twitter:card` shall be `summary_large_image`, its `twitter:title` shall match `og:title`, and its `twitter:description` shall equal `copy`.

#### FR-8.8: Index Metadata

The index page shall have a `<title>` of `Blog | winslow.aero`, and a meta description, `og:description`, and `twitter:description` that describe the blog rather than repeating the site description.

### FR-9: Navigation

#### FR-9.1: Desktop Navigation

The site header's desktop navigation shall include a link labelled "Blog" to `/blog`.

#### FR-9.2: Mobile Navigation

The site header's mobile menu shall include a link labelled "Blog" to `/blog`.

### FR-10: Article Images

Articles reference images only with standard Markdown syntax: `![alt](path)`.

Image paths are root-relative (FR-10.7), so they do not resolve relative to the article file. Images therefore appear broken when an article is viewed outside the site, such as in an ordinary Markdown tool, while the text still reads and renders correctly. This is an accepted consequence.

#### FR-10.1: Rendering

When an article contains a Markdown image, the system shall render it as an image with the alt text written in the article, without any change to the article file.

#### FR-10.2: Maximum Width

The system shall limit each rendered image to the width of the article content column.

#### FR-10.3: Aspect Ratio

The system shall preserve each rendered image's intrinsic aspect ratio.

#### FR-10.4: Lazy Loading

The system shall apply `loading="lazy"` to each rendered article image, without any change to the article file.

#### FR-10.5: Files Served As Committed

The system shall serve article images as committed, with no automatic resizing or format conversion.

#### FR-10.6: Image Location

Every image file referenced from an article body shall be stored in the single flat directory `public/blog/`. This is an authoring rule, not checked by the build.

#### FR-10.7: Image Path

Every image reference in an article body shall use the root-relative form `/blog/<file>`.

#### FR-10.8: No Per-Article Directories

`public/blog/` shall contain no per-article image subdirectories. This is an authoring rule, not checked by the build.

#### FR-10.9: No Images in Content Directory

`src/content/` shall contain no image files, so that no directory mixes image files and `.mdx` files. This is an authoring rule, not checked by the build.

#### FR-10.10: Unique Image Filenames

Because `public/blog/` is flat, image filenames shall be unique across articles. This is an authoring rule, checked by review rather than by the build.

### FR-11: Placeholder Article

The repository shall contain a placeholder article at `src/content/hello-world.mdx`. It shall be published (`archived` absent), shall satisfy the required frontmatter (`title`, `date`, `copy`), and its body shall be a single line of hello-world text.

## Non-Functional Requirements

### NFR-1: Portability

For an article that conforms to FR-3, the sequence of body elements parsed by a CommonMark parser shall match the sequence of body elements the site renders for that article. The comparison excludes the frontmatter block, which a strict CommonMark parser reads as body content (a thematic break plus text), and excludes the page title, date, and site chrome. Images with root-relative paths (FR-10.7) do not resolve outside the site; this is an accepted consequence (see FR-10), not a portability gap. Associating the `.mdx` extension with Markdown is the responsibility of the Markdown tool in use.

### NFR-2: Platform Constraints

#### NFR-2.1: MDX Package

The system shall render articles with `@next/mdx`.

#### NFR-2.2: Bundler

The system shall build with the default `next build` command, under Turbopack, with no webpack opt-out.

#### NFR-2.3: Existing Checks

`next build` and `eslint` shall both exit with code 0 on a repository containing only valid articles.

### NFR-3: Responsive Layout

At every viewport width from 320px to 1440px, the index and article pages shall have no horizontal page overflow, including for articles containing images wider than the viewport and fenced code lines longer than the content column.

### NFR-4: Legibility

The index and article pages shall meet a text contrast ratio of at least 4.5:1 for body text in both the light and dark color schemes the site supports.

### NFR-5: Image Size

Image size is the author's responsibility. There are no numeric limits and no check.

### NFR-6: Article Read Scaling

An article's metadata and page shall read only that article's own file. Only the index page shall read all article files. The number of article file reads during a build shall grow linearly with the number of articles. Article files shall not be read per visitor request.

## Out of Scope

- Migrating, auditing, or importing existing posts from the user's other site.
- Porting the Mustache, esbuild, and Sharp build from the user's other site.
- A CMS, runtime content cache, ISR, or on-demand revalidation.
- Custom MDX components for use in articles.
- Automatic image resizing, format conversion, or responsive `srcset` generation.
- Reserving layout space for article images. Plain Markdown images carry no dimensions, so the browser reserves no space for them and text moves as each image loads, and lazy loading (FR-10.4) adds to this. This layout shift is an accepted v1 trade-off.
- Co-located relative image paths (`./photo.jpg`), `remark-mdx-images`, and build-time image dimensions (all rejected).
- GFM tables, excluded from v1 to save engineering effort. They can be added later.
- Sitemap and RSS feed.
- Tag display, tag pages, and tag filtering.
- Pagination, search, comments, scheduled publishing, and syntax highlighting.

## Open Questions

The remaining items are design inputs or a user action. All other questions are closed and recorded in the requirements above.

- **OQ-10: Production metadata host.** `metadataBase` comes from `process.env.DEPLOY_PRIME_URL ?? "https://winslow.aero"` in `src/app/layout.tsx`. Wherever that variable is set, article `og:url` and `og:image` values use its host rather than `winslow.aero`. The repository has no Netlify configuration, so neither the host nor the variable's production value can be confirmed from the code. User action: check the production value. `metadataBase` is reused unchanged.
- **OQ-12: Docs wording on MDX.** `node_modules/next/dist/docs/01-app/02-guides/mdx.md` calls MDX "a superset of markdown", which contradicts the basis of FR-3. These requirements treat MDX as not a strict superset, per the user's brief, because portability depends on the MDX differences listed in FR-3.2 (GFM tables are excluded there because they are not CommonMark, not because MDX treats them differently). The bundled docs do not list those differences. Resolved by design: the design phase confirms each difference against the installed compiler.
- **OQ-13: Docs example for images.** The bundled MDX guide has no section on Markdown image syntax. Its only `img` example maps images to `next/image` with no dimensions, while the `next/image` docs require `width` and `height` unless the image is statically imported or uses `fill`. Markdown images in `public/` provide neither, so that example cannot be copied as written. Resolved by design: article images render as plain `img` elements, never `next/image` (FR-10.5).
