# winslow-aero-site

Source for [winslow.aero](https://winslow.aero), the personal business site of Sam Winslow, a software engineer turned commercial pilot based in the San Francisco Bay Area.

The site covers:

- **Services:** ground instruction, aircraft ferrying, software development, and startup advisement
- **About:** background and experience
- **Contact:** a Tally form and links
- **Posts:** writing for pilots and people interested in flying, on training, skills, destinations, community, and ownership

## How it works

- **Static site.** Every page is prerendered at build time with Next.js (App Router), React, and Tailwind CSS. Nothing reads content on a visitor request.
- **Posts are files.** Each `.mdx` file in `src/content/` is one post, and its filename is the slug. Posts are plain Markdown with YAML frontmatter and no components or imports. See [src/content/README.md](src/content/README.md) for authoring rules.
- **Publishing is a commit and a deploy.** There is no CMS.
- **Feeds and SEO.** The build generates `/sitemap.xml`, `/robots.txt`, and an RSS feed at `/feed.xml`.
- **Analytics.** PostHog, configured in `instrumentation-client.ts`.

## Layout

```text
src/app/          Routes: home, /about, /contact, /posts, plus sitemap, robots, and RSS
src/app/components/  Shared Header, Footer, and icons
src/content/      Post files (.mdx)
public/           Static assets; post images live in public/blog/
ideas/            Unpublished post topic ideas
.specs/           Spec-Driven Development steering docs and feature specs
```

More detail is in [.specs/steering/](.specs/steering/).

## Setup

```bash
npm install
cp .env.example .env.local   # add your PostHog token
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it.

## Build and check

```bash
npm run build     # production build
npm run lint      # eslint
npx tsc --noEmit  # type check (run after a build, which generates route types)
```
