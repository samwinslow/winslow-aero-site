import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CORE_SCHEMA, load } from "js-yaml";

export type Article = {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD", kept as a string everywhere
  copy: string;
  tags: string[];
  image?: string;
  archived: boolean;
};

const CONTENT_DIR = path.join(process.cwd(), "src/content");
const FILENAME = /^[a-z0-9]+(-[a-z0-9]+)*\.mdx$/;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

function invalid(file: string, reason: string): Error {
  return new Error(`Invalid article src/content/${file}: ${reason}`);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function parseFrontmatter(file: string, raw: string): Record<string, unknown> {
  const match = FRONTMATTER.exec(raw);
  if (!match) {
    throw invalid(file, "missing YAML frontmatter block");
  }

  let data: unknown;
  try {
    // CORE_SCHEMA has no timestamp type, so an unquoted date stays a string.
    data = load(match[1], { schema: CORE_SCHEMA });
  } catch (error) {
    throw invalid(file, `frontmatter is not valid YAML: ${String(error)}`);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw invalid(file, "frontmatter must be a mapping");
  }
  return data as Record<string, unknown>;
}

function parseArticle(file: string, raw: string): Article {
  const data = parseFrontmatter(file, raw);
  const { title, date, copy } = data;

  if (!isNonEmptyString(title)) {
    throw invalid(file, "title must be a non-empty string");
  }
  if (!isCalendarDate(date)) {
    throw invalid(file, "date must be a real calendar date in YYYY-MM-DD format");
  }
  if (!isNonEmptyString(copy)) {
    throw invalid(file, "copy must be a non-empty string");
  }

  const tags = "tags" in data ? data.tags : [];
  if (
    !Array.isArray(tags) ||
    !tags.every((tag): tag is string => typeof tag === "string")
  ) {
    throw invalid(file, "tags must be a list of strings");
  }

  const image = data.image;
  if (
    "image" in data &&
    (typeof image !== "string" || !/^\/[^/]/.test(image))
  ) {
    throw invalid(file, "image must be a root-relative path");
  }

  const archived = "archived" in data ? data.archived : false;
  if (typeof archived !== "boolean") {
    throw invalid(file, "archived must be a boolean");
  }

  return {
    slug: file.slice(0, -".mdx".length),
    title,
    date,
    copy,
    tags,
    ...(typeof image === "string" ? { image } : {}),
    archived,
  };
}

export function getArticleSlugs(): string[] {
  return readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map(({ name }) => {
      if (!FILENAME.test(name)) {
        throw invalid(name, "filename must be lowercase words joined by hyphens");
      }
      return name.slice(0, -".mdx".length);
    });
}

export function getArticle(slug: string): Article | undefined {
  const file = `${slug}.mdx`;
  if (!FILENAME.test(file)) {
    return undefined;
  }

  let raw: string;
  try {
    raw = readFileSync(path.join(CONTENT_DIR, file), "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
  return parseArticle(file, raw);
}

// Reads every article file, so only the index page should call this.
export function getAllArticles(): Article[] {
  return getArticleSlugs()
    .map((slug) => getArticle(slug))
    .filter((article): article is Article => !!article && !article.archived)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date < b.date ? 1 : -1;
      }
      return a.slug < b.slug ? -1 : 1;
    });
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
