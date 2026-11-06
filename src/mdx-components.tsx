import type { MDXComponents } from "mdx/types";

const heading = "font-semibold";

const components: MDXComponents = {
  h1: (props) => <h1 {...props} className={`${heading} text-[1.875rem]`} />,
  h2: (props) => <h2 {...props} className={`${heading} text-[1.625rem]`} />,
  h3: (props) => <h3 {...props} className={`${heading} text-[1.4375rem]`} />,
  h4: (props) => <h4 {...props} className={`${heading} text-[1.3125rem]`} />,
  h5: (props) => <h5 {...props} className={`${heading} text-[1.25rem]`} />,
  h6: (props) => <h6 {...props} className={`${heading} text-[1.1875rem]`} />,
  a: (props) => (
    <a {...props} className="text-brand-blue underline dark:text-brand-aqua" />
  ),
  ul: (props) => <ul {...props} className="list-disc pl-5" />,
  ol: (props) => <ol {...props} className="list-decimal pl-5" />,
  blockquote: (props) => (
    <blockquote {...props} className="border-l-4 border-foreground/20 pl-4" />
  ),
  code: (props) => (
    <code
      {...props}
      className="rounded bg-foreground/10 px-1 py-0.5 text-[0.9em]"
    />
  ),
  pre: (props) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-lg bg-foreground/10 p-4 text-sm [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[1em]"
    />
  ),
  hr: (props) => <hr {...props} className="border-foreground/20" />,
  img: ({ alt, ...props }) => (
    // Plain img by design. Article images have no dimensions; see design.md.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      loading="lazy"
      className="max-w-full h-auto rounded-lg"
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
