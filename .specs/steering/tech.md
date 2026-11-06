# Tech Stack and Conventions

## Stack

- **Language:** TypeScript 5
- **Framework:** Next.js 16.3.6 with the App Router, building with Turbopack
- **UI:** React 19.2.8 and Tailwind CSS 4
- **Content:** `@next/mdx`, `remark-frontmatter`, and `js-yaml`
- **Analytics:** PostHog, through `posthog-js`
- **Contact form:** Tally embed
- **Database:** none
- **Hosting:** appears to be Netlify, based on `DEPLOY_PRIME_URL` in `src/app/layout.tsx`. The repo has no Netlify config.

This version of Next differs from older ones. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code, as `AGENTS.md` requires.

## Code Conventions

- Use double quotes, semicolons, and two-space indentation.
- Use the `@/` import alias for `src/`, or relative imports within a route.
- Keep route code beside its route. There is no `src/lib/`.
- Pages are Server Components by default. Add `"use client"` only where needed, as in `Header.tsx`.
- Style with Tailwind utility classes. Colors are CSS variables in `src/app/globals.css`, including `--brand-blue` (`#1616CC`) and `--brand-aqua` (`#109393`).
- Page metadata replaces the layout's `openGraph` and `twitter` objects whole. Spread `sharedOpenGraph` and `sharedTwitter` from `src/app/site-metadata.ts` on every page that sets them.
- Do not enable Cache Components. It conflicts with `dynamicParams` on the posts route.
- Do not add `loading.tsx` or `<Suspense>` around `/posts/[slug]`. Streaming would turn the 404 for archived posts into a 200.

## Testing

There is no test framework and there are no test files, and none should be added without a request. Verify work with `next build`, `eslint`, `tsc --noEmit`, and by inspecting the generated HTML in `.next/server/app/`.

Use temporary fixtures in `src/content/` when needed, and remove them afterward.

Do not run `npm run dev` or `next dev`, and do not curl a dev server.

## Dependencies

- Use npm, and commit `package-lock.json`.
- Keep `next`, `eslint-config-next`, and `@next/mdx` on the same exact version.
- Prefer few dependencies. Do not add a schema library or Markdown renderer for post metadata.
- Do not use `--force` or `--legacy-peer-deps`.

## Build and Run

Run `next build` before `tsc --noEmit`, because `PageProps` and `LayoutProps` are generated types.

```sh
npm install
npm run build     # production build
npm run lint      # eslint
npx tsc --noEmit  # type check
```

Work directly in the main working tree and write files as you go, so the user can see work in progress. Do not use git worktrees.
