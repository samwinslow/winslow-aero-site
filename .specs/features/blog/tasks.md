# Tasks: blog

<!-- This file is owned by the tasks-agent. Do not edit manually during SDD workflow. -->

## Overview

3 tasks. Scope: 7 new packages, 1 config change, 6 new source and content files in the core build, 1 header line, and 1 README. Task 1 and Task 2 carry the early checks (V-0, V-1, V-2), so a failure stops work before the remaining task starts.

Rules for every task:

- Never run `npm run dev` or `next dev`, and never curl a dev server. Verification is through `next build`, `eslint`, `tsc --noEmit`, and build output.
- There is no test runner and no test files. The last sub-task of each task is a manual build check from the Verification Plan in `design.md`. task-tester runs that check and adds no test files.
- Run `next build` before `tsc --noEmit`. The `LayoutProps` and `PageProps` helpers are generated types, so `tsc` fails on a tree with no generated `.next/types`.
- When checking a build's exit code, read the code of `next build` itself, not of a pipeline it is piped through.
- Before writing Next code, read the relevant guide in `node_modules/next/dist/docs/`, as `AGENTS.md` requires. For this feature that is `01-app/02-guides/mdx.md`.
- Do not modify `requirements.md` or `design.md`. If a check shows the design or requirements are wrong, stop and report it. The orchestrator routes it to the design or requirements agent.

---

## Task 1: Install dependencies and configure MDX

- [ ] 1. Install dependencies and configure MDX

**Description:** Add the packages from the design's Dependencies table, wrap `next.config.ts` with `createMDX`, and confirm the installed compiler's behavior against Q4 before any article code is written.

**Sub-tasks:**

- [ ] 1.1. Install the packages. Together these add every package in the Dependencies table.
  - `npm install --save-exact @next/mdx@16.3.6`
  - `npm install @mdx-js/loader @mdx-js/react remark-frontmatter js-yaml@^4.3.2`
  - `npm install --save-dev @types/mdx @types/js-yaml`
  - `@next/mdx` must appear in `package.json` as exactly `16.3.6`, and `js-yaml` must stay at 4.3.2 in the lockfile.
  - If npm reports a peer conflict, stop and report it. Do not use `--force` or `--legacy-peer-deps`.
- [ ] 1.2. Read the installed `@next/mdx` source (the V-0 reading: Turbopack rule, string plugin resolution, types), then edit `next.config.ts` as shown in the design's Interfaces section.
  - Set `pageExtensions` to `["js", "jsx", "md", "mdx", "ts", "tsx"]`.
  - Call `createMDX({ options: { remarkPlugins: ["remark-frontmatter"] } })`, with the plugin named by string.
  - Export `withMDX(nextConfig)`.
  - Keep the existing commented `headers` block inside `nextConfig`, unchanged.
  - If the types reject a string plugin, use a narrow cast on `options`, or rename to `next.config.mjs` as the design allows. A rename must also keep the commented `headers` block.
  - Do not enable `experimental.mdxRs` or Cache Components. Add no webpack opt-out, and leave the `build` script unchanged.
- [ ] 1.3. Manual build check: V-0 and V-1.
  - **V-0:** Report in the completion summary what the source showed for the Turbopack rule, string plugin resolution, and the type of `remarkPlugins`, and which config form was used. If the source contradicts Q1 in a way the fallbacks in 1.2 do not cover, stop and report.
  - **V-1:** Write a throwaway script in the session scratch directory, not in the repository. Import `@mdx-js/mdx` and `remark-frontmatter` by absolute path from this repository's `node_modules`, so the installed versions are what runs. Use `format: "mdx"` and `remark-frontmatter`, with no GFM plugin. Run every row of the Q4 table through `compile`, and through `evaluate` plus React's `renderToStaticMarkup` for rows whose expected result depends on rendering.
  - Report the observed result for each Q4 row in the completion summary. Do not edit `design.md`.
  - The "`import` of a missing module" row expects a bundler error, which `compile` and `evaluate` do not exercise. Report the compile result and mark that row "bundler not exercised". This alone is not a contradiction.
  - If any result contradicts FR-4.5 or Q4, stop and report it. Do not continue to Task 2 and do not work around it.
  - Run `next build`, then `eslint`, then `tsc --noEmit`. All three must exit 0. The site has no blog routes yet, so this confirms only that the config loads and type-checks.

**Requirements:** NFR-2.1, NFR-2.2, FR-2.8, FR-4.5, NFR-1
**Design Reference:** `next.config.ts` component, Interfaces (`next.config.ts`), Q1, Q4, Dependencies, V-0, V-1
**Files:** `package.json`, `package-lock.json`, `next.config.ts`

---

## Task 2: Build the article pipeline, blog routes, and placeholder article

- [ ] 2. Build the article pipeline, blog routes, and placeholder article

**Description:** Implement the metadata path, the body path, both pages, and the permanent placeholder article, then prove the whole path with V-2. These pieces stay in one task because V-2 cannot pass until all of them exist. `src/content/` must exist before the routes build, because `getArticleSlugs()` lists it and the template import resolves against it.

**Sub-tasks:**

- [ ] 2.1. Create `src/app/blog/articles.ts` with the `Article` type and `getArticleSlugs`, `getArticle`, `getAllArticles`, and `formatDate`, as specified in the design's Data Model and Interfaces sections.
  - Use the `FILENAME` and `FRONTMATTER` regexes from the design, and `load(block, { schema: CORE_SCHEMA })` from `js-yaml`.
  - `getArticleSlugs()` lists `src/content/` non-recursively, considers only regular files ending in `.mdx`, reads no contents, and throws on a bad filename.
  - `getArticle(slug)` reads only `src/content/<slug>.mdx`. It returns `undefined` when `<slug>.mdx` fails `FILENAME` or the file does not exist, returns archived articles with `archived: true`, and throws on invalid content.
  - `getAllArticles()` loops over `getArticleSlugs()` with the same per-file read, drops archived articles, and sorts by `date` descending, then `slug` ascending, using plain `<` comparison. Add no module-level memo or React `cache()`.
  - Implement the field rules table by hand, with no schema library. "Present" means the key exists, so `tags:` with an empty value fails. Unknown keys are ignored.
  - Every failure throws `Invalid article src/content/<file>.mdx: <reason>`. Catch `load` errors and rethrow them in this form.
  - `new Date(...).toISOString()` throws a `RangeError` on an invalid date such as `2026-13-01`. The date rule must check for an invalid `Date` first, so these values produce the error above and name the file (FR-4.3).
  - `formatDate` uses `Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" })` on `` `${date}T00:00:00Z` ``, producing `March 14, 2026`.
- [ ] 2.2. Create `src/app/blog/metadata.ts` with `blogMetadata({ title, description, path, image = DEFAULT_IMAGE, type })` as shown in the design, with `DEFAULT_IMAGE = "/og-image-wtext.jpg"`. It states every `openGraph` and `twitter` field listed there. Do not change `layout.tsx`.
- [ ] 2.3. Create `src/mdx-components.tsx`, exporting a no-argument `useMDXComponents(): MDXComponents` with the design's element map: `h1` to `h6` at the listed sizes, `a`, `ul`, `ol`, `blockquote`, `code`, `pre`, `hr`, and `img`. Use the `img` mapping exactly as written in the design: a plain `<img>`, not `next/image`, with `loading="lazy"` after the prop spread and the lint-disable comment. Use plain `<a>` for links.
- [ ] 2.4. Create `src/app/blog/[slug]/page.tsx` as shown in the design.
  - `dynamicParams = false`; `generateStaticParams` uses only `getArticleSlugs()`.
  - `generateMetadata` and `Page` both call `getArticle(slug)` and `notFound()` when it is `undefined` or archived. `generateMetadata` calls `blogMetadata` with `title`, `copy`, `/blog/<slug>`, `image`, and type `"article"`.
  - `Page` imports the body with ``await import(`@/content/${slug}.mdx`)`` only after the `notFound()` check.
  - Markup: `<main className="mx-auto max-w-2xl px-6 py-16">`, the title as `<h1 className="text-3xl font-semibold">`, `<time dateTime={date}>` with `text-foreground/70` showing `formatDate(date)`, then the body in a wrapper with `flex flex-col gap-5 text-lg break-words`.
  - Type `params` with the `PageProps<"/blog/[slug]">` helper.
- [ ] 2.5. Create `src/app/blog/page.tsx`.
  - Export metadata from `blogMetadata({ title: "Blog", description, path: "/blog", type: "website" })`, with the description `Articles for pilots and people interested in flying: training, gear, skills, destinations, community, and ownership.`
  - Call `getAllArticles()`. Do not import any MDX module.
  - Use the same `main` width as the article page, and `<h1 className="text-3xl font-semibold">Blog</h1>`.
  - Each entry shows `title`, the `formatDate` date in `<time>` with `text-foreground/70`, and `copy`, and links to `/blog/<slug>` with `next/link`.
  - With no articles, render the message `No articles yet.`
  - Do not add a `loading.tsx` or a `<Suspense>` under `/blog`. The 404 status of archived pages depends on the response not being streamed.
- [ ] 2.6. Create `src/content/hello-world.mdx`, which is permanent. It has `title: Hello, world`, `date: 2026-11-05`, `copy: A placeholder article for the winslow.aero blog.`, no `archived` key, no `image` key, and a body of the single line `Hello, world.`
- [ ] 2.7. Manual build check: V-2.
  - Add two temporary fixtures. Do not create an image file, because a missing image is not detected by the build (FR-4.5).
    - `src/content/v2-published.mdx`: unquoted `date: 2026-03-14`, `tags: [v2tagsentinel]`, `image: /og-image.jpg`, and a body exercising every FR-3.1 construct (headings 1 to 6, paragraph, emphasis, strong, ordered list, unordered list, blockquote, inline code, fenced code block, thematic break, inline link) plus `![Fixture alt text](/blog/v2-fixture.jpg)`.
    - `src/content/v2-archived.mdx`: valid frontmatter, `archived: true`, and a body containing the text `v2archivedbody`.
  - Run `next build`, then `eslint`, then `tsc --noEmit`. All three must exit 0. Check the build output for warnings, including `src/content/` tracing noise, and report any.
  - Inspect `.next/server/app/blog/v2-published.html`:
    - `v2tagsentinel` does not appear, so no frontmatter text is rendered.
    - Every FR-3.1 element is present with its mapped classes, and the body `h1` sits in its place after the title and date.
    - The image is a plain `img` with `src="/blog/v2-fixture.jpg"`, its alt text, and `loading="lazy"`, not routed through `/_next/image`.
    - `March 14, 2026` is shown, and `<time>` carries `2026-03-14`.
    - `<title>` is `<title> | winslow.aero`. Meta description, `og:description`, and `twitter:description` equal `copy`. `og:title` and `twitter:title` are `<title> | winslow.aero`. `og:site_name` is `winslow.aero`, `og:type` is `article`, and `twitter:card` is `summary_large_image`.
    - `og:url` is `/blog/v2-published`, and `og:image` and `twitter:image` are `/og-image.jpg`, each resolved against `metadataBase`.
    - The page is inside the site header and footer, and its `main` has `max-w-2xl`.
  - Inspect `.next/server/app/blog/hello-world.html`: `og:image` and `twitter:image` are `/og-image-wtext.jpg`, resolved against `metadataBase`.
  - Inspect `.next/server/app/blog.html` (the index sits beside `blog/`, not inside it): `<title>` is `Blog | winslow.aero`, the blog description is in the meta description, `og:description`, and `twitter:description`, the published entries show title, date, and copy with their links, and the archived article's title does not appear.
  - Inspect `.next/prerender-manifest.json`: `/blog/v2-archived` is listed under `routes`, and `/blog/[slug]` has `fallback: false`.
  - Inspect `.next/server/app/blog/v2-archived.meta`: `status` is 404. Inspect `.next/server/app/blog/v2-archived.html`: `v2archivedbody` does not appear.
  - Remove both fixtures, and confirm `src/content/` holds only `hello-world.mdx`. Remove them even if a check failed.
  - Fix ordinary coding errors in this task's files and re-run. If frontmatter stripping, the `img` mapping, the stored 404 status, or the string plugin behaves differently than the design states, stop and report it. The design must be revisited before Task 3.

**Requirements:** FR-1, FR-1.1, FR-1.2, FR-2, FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7, FR-2.8, FR-3.1, FR-3.5, FR-4.2, FR-4.3, FR-5, FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-6, FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5, FR-6.6, FR-7.1, FR-7.2, FR-7.3, FR-7.4, FR-7.5, FR-7.6, FR-7.7, FR-8, FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5, FR-8.6, FR-8.7, FR-8.8, FR-10, FR-10.1, FR-10.2, FR-10.3, FR-10.4, FR-10.5, FR-11, NFR-1, NFR-2.3, NFR-3, NFR-4, NFR-6
**Design Reference:** `articles.ts`, `metadata.ts`, `mdx-components.tsx`, `blog/page.tsx`, `[slug]/page.tsx`, `hello-world.mdx`, Data Model, Interfaces, Q2, Q3, Q5, Q6, Q7, V-2
**Files:** `src/app/blog/articles.ts`, `src/app/blog/metadata.ts`, `src/mdx-components.tsx`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/content/hello-world.mdx`, plus temporary fixtures removed before the task finishes

---

## Task 3: Add the header link and authoring rules, and run the failure and time zone checks

- [ ] 3. Add the header link and authoring rules, and run the failure and time zone checks

**Description:** Add the "Blog" navigation link and `src/content/README.md`, the only home for rules the build does not check. Then run the remaining checks against the finished site: failure paths (V-3, V-4), date stability (the V-6 TZ rebuild), and read scaling (V-8).

**Sub-tasks:**

- [ ] 3.1. In `src/app/components/Header.tsx`, add `{ href: "/blog", label: "Blog" }` to `links`, between About and Contact. The desktop and mobile navs both map this array, so nothing else changes in this file.
- [ ] 3.2. Create `src/content/README.md` with the authoring rules. It must state:
  - File rules: each `.mdx` directly in `src/content/` is one article, the filename pattern, and that the filename is the slug (FR-1, FR-1.1, FR-1.2).
  - Frontmatter: `title`, `date`, and `copy` are required, `tags`, `image`, and `archived` are optional, with their formats. Article metadata comes only from frontmatter, `image` is for social sharing only, and archived articles return 404 (FR-2, FR-5).
  - The portable subset: article bodies use the syntax CommonMark and MDX read the same way, the supported constructs of FR-3.1, CommonMark only, no GFM, and bare URLs do not become links.
  - The full FR-3.2 table of excluded constructs and their portable alternatives.
  - Every image needs non-empty alt text (FR-3.4). Articles need no MDX components and contain no `import`, `export`, or JSX (FR-3.5).
  - Image rules: files live in the flat `public/blog/` directory with no per-article subdirectories (FR-10.6, FR-10.8), references use `/blog/<file>` (FR-10.7), no image files in `src/content/` (FR-10.9), filenames are unique across articles and checked by review (FR-10.10), images look broken outside the site and this is accepted (FR-10), and image size is the author's responsibility, with no limits and no check (NFR-5).
  - Limits of the build: the FR-4.5 list of cases the build does not detect, stated as authoring rules.
  - Publishing: commit the file and deploy. Changes take effect only on the next build and deploy (FR-5.4).
- [ ] 3.3. Manual build check: V-3, V-4, V-6 (TZ rebuild only), V-8, then a clean-tree run of the V-2 commands.
  - **V-3:** One `next build` per row of the defect table below, each with one temporary file in `src/content/` and otherwise valid frontmatter and body. Each build must exit non-zero, and its output must contain `Invalid article src/content/<file>` for that fixture. Remove the fixture before the next row.
  - **V-4:** Add `src/content/v4-compile-error.mdx` with valid frontmatter and a body containing an unclosed `<br>`. `next build` must exit non-zero. Report whether the output names the file. FR-4.3 requires no more than `next build` already does, so add no tooling. Remove the fixture.
  - **V-6 (TZ rebuild):** Recreate the Task 2 `v2-published.mdx` fixture with `date: 2026-03-14`. Run `TZ=Pacific/Pago_Pago npm run build` and `TZ=Pacific/Kiritimati npm run build`. After each build, confirm `.next/server/app/blog/v2-published.html` and `.next/server/app/blog.html` show `March 14, 2026`. Remove the fixture. The deploy-preview part of V-6 is not part of this task.
  - **V-8:** Code review. `generateStaticParams` uses only `getArticleSlugs()`, which uses only `readdir`. `getArticle` opens one file. `getAllArticles` is called only from `src/app/blog/page.tsx`. Report the result.
  - **Clean tree:** Confirm `src/content/` holds only `hello-world.mdx` and `README.md`, then run `next build`, `eslint`, and `tsc --noEmit`. All three must exit 0 (NFR-2.3).
  - Remove every temporary fixture even if a check failed. If a V-3 or V-6 failure is a defect in `articles.ts`, fix it there and re-run the failed row. If a failure comes from Next or compiler behavior that differs from Q3, stop and report it.

**V-3 defect table:**

| # | Fixture filename | Defect |
|---|---|---|
| 1 | `Bad_Name.mdx` | Filename fails `FILENAME` |
| 2 | `v3-no-frontmatter.mdx` | No frontmatter block |
| 3 | `v3-bad-yaml.mdx` | Invalid YAML, e.g. `title: [unclosed` |
| 4 | `v3-not-mapping.mdx` | Block parses to a list, not a mapping |
| 5 | `v3-title.mdx` | `title: "   "`, blank after trim |
| 6 | `v3-date-format.mdx` | `date: 03/14/2026` |
| 7 | `v3-date-calendar.mdx` | `date: 2026-02-30` |
| 8 | `v3-date-range.mdx` | `date: 2026-13-01` |
| 9 | `v3-copy.mdx` | `copy` key missing |
| 10 | `v3-tags.mdx` | `tags: training`, not a list |
| 11 | `v3-image.mdx` | `image: photo.jpg`, not root-relative |
| 12 | `v3-archived.mdx` | `archived: "yes"`, not a boolean |

**Requirements:** FR-1, FR-1.1, FR-1.2, FR-2, FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-2.5, FR-2.6, FR-2.7, FR-3, FR-3.1, FR-3.2, FR-3.4, FR-3.5, FR-4.1, FR-4.2, FR-4.3, FR-4.5, FR-5, FR-5.4, FR-7.3, FR-9, FR-9.1, FR-9.2, FR-10, FR-10.6, FR-10.7, FR-10.8, FR-10.9, FR-10.10, NFR-2.3, NFR-5, NFR-6
**Design Reference:** `Header.tsx`, `src/content/README.md`, Q3, Q4, Q6, V-3, V-4, V-6, V-8
**Files:** `src/app/components/Header.tsx`, `src/content/README.md`, `src/app/blog/articles.ts` (only to fix a defect found by V-3 or V-6), plus temporary fixtures removed before the task finishes

---

## Requirement Coverage

| Requirement | Task(s) | Notes |
|-------------|---------|-------|
| FR-1 | Task 2, Task 3 | README states the rule |
| FR-1.1 | Task 2, Task 3 | README states the rule |
| FR-1.2 | Task 2, Task 3 | Implemented in Task 2; V-3 in Task 3 |
| FR-2 | Task 2, Task 3 | README states the rule |
| FR-2.1 | Task 2, Task 3 | README states the rule |
| FR-2.2 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.3 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.4 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.5 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.6 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.7 | Task 2, Task 3 | V-3 in Task 3 |
| FR-2.8 | Task 1, Task 2 | Plugin in Task 1; V-2 in Task 2 |
| FR-3 | Task 3 | README |
| FR-3.1 | Task 2, Task 3 | V-2; README lists the constructs |
| FR-3.2 | Task 3 | README; authoring rule |
| FR-3.4 | Task 3 | README; authoring rule |
| FR-3.5 | Task 2, Task 3 | Element map only; README states the rule |
| FR-4.1 | Task 3 | Behavior comes from the template import in Task 2; V-4 in Task 3 |
| FR-4.2 | Task 2, Task 3 | V-3 in Task 3 |
| FR-4.3 | Task 2, Task 3 | V-3 and V-4 in Task 3 |
| FR-4.5 | Task 1, Task 3 | V-1 results reported in Task 1; README in Task 3 |
| FR-5 | Task 2, Task 3 | V-2; README states the rule |
| FR-5.1 | Task 2 | V-2 |
| FR-5.2 | Task 2 | Implemented and checked in build output by V-2. The hosted check (V-7) is the user's, after deploy |
| FR-5.3 | Task 2 | Implemented and `fallback: false` checked by V-2. The hosted check (V-7) is the user's, after deploy |
| FR-5.4 | Task 2, Task 3 | Static pages; README states the rule |
| FR-6 | Task 2 | V-2 |
| FR-6.1 | Task 2 | V-2 |
| FR-6.2 | Task 2 | No Verification Plan step; implemented only |
| FR-6.3 | Task 2 | No Verification Plan step; implemented only |
| FR-6.4 | Task 2 | V-2 |
| FR-6.5 | Task 2 | V-2 |
| FR-6.6 | Task 2 | Design assigns no dedicated step; implemented only |
| FR-7.1 | Task 2 | V-2 |
| FR-7.2 | Task 2 | V-2 |
| FR-7.3 | Task 2, Task 3 | Implemented in Task 2; V-6 TZ rebuild in Task 3 |
| FR-7.4 | Task 2 | V-2 |
| FR-7.5 | Task 2 | V-2 |
| FR-7.6 | Task 2 | V-2 |
| FR-7.7 | Task 2 | V-2 |
| FR-8 | Task 2 | V-2 |
| FR-8.1 | Task 2 | V-2 |
| FR-8.2 | Task 2 | V-2 |
| FR-8.3 | Task 2 | V-2 |
| FR-8.4 | Task 2 | V-2 |
| FR-8.5 | Task 2 | V-2, `v2-published` fixture |
| FR-8.6 | Task 2 | V-2, `hello-world` |
| FR-8.7 | Task 2 | V-2 |
| FR-8.8 | Task 2 | V-2 |
| FR-9 | Task 3 | No Verification Plan step; covered by the build run only |
| FR-9.1 | Task 3 | Shared `links` array |
| FR-9.2 | Task 3 | Shared `links` array |
| FR-10 | Task 2, Task 3 | `img` mapping; README states the accepted consequence |
| FR-10.1 | Task 2 | V-2 |
| FR-10.2 | Task 2 | V-2 |
| FR-10.3 | Task 2 | V-2 |
| FR-10.4 | Task 2 | V-2 |
| FR-10.5 | Task 2 | V-2 |
| FR-10.6 | Task 3 | README; authoring rule |
| FR-10.7 | Task 3 | README; authoring rule |
| FR-10.8 | Task 3 | README; authoring rule |
| FR-10.9 | Task 3 | README; authoring rule |
| FR-10.10 | Task 3 | README; authoring rule |
| FR-11 | Task 2 | Permanent file |
| NFR-1 | Task 1, Task 2 | V-1, V-2 |
| NFR-2.1 | Task 1 | |
| NFR-2.2 | Task 1 | |
| NFR-2.3 | Task 2, Task 3 | V-2; clean-tree run in Task 3 |
| NFR-3 | Task 2 | Styling implemented as designed. The V-6 deploy-preview check is not assigned |
| NFR-4 | Task 2 | Styling implemented as designed. The V-6 deploy-preview check is not assigned |
| NFR-5 | Task 3 | README; no component by design |
| NFR-6 | Task 2, Task 3 | Implemented in Task 2; V-8 in Task 3 |

Not task work: V-7 is the user's step after deploy and blocks nothing. OQ-10 (the production value of `DEPLOY_PRIME_URL`) is a user action.
