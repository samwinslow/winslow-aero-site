# Writing articles

Each `.mdx` file directly in this directory is one article. To publish, commit the file and deploy. Changes take effect only on the next build and deploy.

## Filename

The filename is the URL slug: `first-solo.mdx` becomes `/posts/first-solo`. Use lowercase letters and numbers, with single hyphens between words. Anything else fails the build.

## Frontmatter

Every article starts with a YAML block. Metadata comes only from this block.

```yaml
---
title: Your first cross-country
date: 2026-03-14
copy: What I wish I had known before planning my first solo cross-country.
tags: [training]
image: /blog/first-cross-country.jpg
archived: false
---
```

| Field | Required | Format |
| --- | --- | --- |
| `title` | Yes | Non-empty text |
| `date` | Yes | Real calendar date, `YYYY-MM-DD` |
| `copy` | Yes | Non-empty text, used as the summary and description |
| `tags` | No | List of text values, stored but not displayed |
| `image` | No | Root-relative path, used for the /posts thumbnail and social sharing |
| `archived` | No | `true` or `false`, defaults to `false` |

Archived articles are not listed and return a 404.

## Body

Article bodies use the syntax CommonMark and MDX read the same way: headings, paragraphs, emphasis, strong emphasis, ordered and unordered lists, blockquotes, inline code, fenced code blocks, thematic breaks, inline links, and images.

A `#` heading renders as an `h1` after the page title, so don't repeat the title in the body.

This is CommonMark only, with no GitHub Flavored Markdown. Bare URLs don't become links.

Articles need no MDX components, and contain no `import`, `export`, or JSX.

Don't use these:

| Excluded | Use instead |
| --- | --- |
| Unescaped `<` in prose | `\<`, or inline code |
| Unescaped `{` in prose | `\{`, or inline code |
| HTML comments | Remove them |
| Raw HTML tags | Markdown syntax |
| Indented code blocks | Fenced code blocks |
| Autolinks like `<https://example.com>` | Inline links |
| `import` or `export` statements | Frontmatter for metadata |
| JSX, including `<Image />` | `![alt](path)` for images |
| Tables | Nothing yet |

## Images

- Put image files in `public/blog/`, with no per-article subdirectories.
- Never put image files in this directory.
- Reference them as `![Alt text](/blog/photo.jpg)`. Every image needs alt text.
- Keep filenames unique across articles.
- Images in `public/blog/` are served through Next's image optimizer, so they're resized and converted automatically. Files still in the frontmatter `image` field are served as committed.
- A body image that points to a missing file fails the build.

Images appear broken when an article is viewed outside the site. That's expected.

## What the build doesn't catch

These compile without an error, so they're up to you:

- Indented code blocks, which render as paragraphs
- Valid expressions like `{2}`, which render their value
- A missing file in the frontmatter `image` field
- Tables, which render as plain text
- Empty alt text
- Balanced raw HTML, `export`, and resolvable `import` statements

The behavior above hasn't been confirmed against the compiler.
