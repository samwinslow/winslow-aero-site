import { readFileSync } from "node:fs";
import path from "node:path";
import type { ComponentProps } from "react";
import { imageSize } from "image-size";
import { getImageProps } from "next/image";

// The post column is 42rem wide with 1.5rem of padding on each side.
const SIZES = "(min-width: 42rem) 39rem, calc(100vw - 3rem)";
const CLASS_NAME = "max-w-full h-auto rounded-lg";

function readDimensions(src: string) {
  const file = path.join(process.cwd(), "public", src);
  const { width, height, orientation } = imageSize(readFileSync(file));

  // EXIF orientations 5 to 8 store the photo rotated a quarter turn.
  return orientation && orientation >= 5
    ? { width: height, height: width }
    : { width, height };
}

// Renders a Markdown image through Next's image optimizer as a plain <img>.
// Pages are prerendered, so the file is only read during the build.
export default function PostImage({ src, alt }: ComponentProps<"img">) {
  const altText = alt ?? "";

  if (typeof src !== "string" || !/^\/[^/]/.test(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={altText} loading="lazy" className={CLASS_NAME} />;
  }

  const { props } = getImageProps({
    src,
    alt: altText,
    sizes: SIZES,
    ...readDimensions(src),
  });

  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={altText} className={CLASS_NAME} />;
}
