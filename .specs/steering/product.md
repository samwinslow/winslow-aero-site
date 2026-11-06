# Product Context

## Product Overview

winslow.aero is the personal business site of Sam Winslow, a software engineer turned commercial pilot based in the San Francisco Bay Area. It presents his services (ground instruction, aircraft ferrying, software development, and startup advisement), his background, and a way to get in touch. It also publishes posts for pilots and people interested in flying.

## Users

- **Prospective clients:** student pilots, aircraft owners, and companies looking for flying or software help. They want to learn what Sam offers and contact him.
- **Pilots and aviation-curious readers:** they read posts on training, skills, destinations, community, and ownership. Topic ideas are in `ideas/article-ideas.md`.
- **The author:** Sam writes and publishes posts himself, so the authoring path must stay simple.

## Key Principles

- **Keep the first pass simple.** Build the plainest version that works, and add behavior only when there is a real need.
- **Publishing is a commit and a deploy.** There is no CMS, runtime content layer, ISR, or revalidation.
- **Post files stay portable.** Posts are `.mdx` files written as standard Markdown with YAML frontmatter, and they use no components, imports, or JSX. Images may look broken outside the site, and that is accepted.
- **Pages are static.** Nothing should read content on a visitor request.
- **Don't add lint steps or content scans for authoring rules.** A file that fails to compile may fail the build, and that is acceptable.
