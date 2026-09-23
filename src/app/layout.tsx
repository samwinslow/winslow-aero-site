import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "winslow.aero",
  icons: {
    icon: [
      { url: "/stamp/stamp-24.png", sizes: "24x24", type: "image/png" },
      { url: "/stamp/stamp-72.png", sizes: "72x72", type: "image/png" },
      { url: "/stamp/stamp-144.png", sizes: "144x144", type: "image/png" },
      { url: "/stamp/stamp-256.png", sizes: "256x256", type: "image/png" },
      { url: "/stamp/stamp-512.png", sizes: "512x512", type: "image/png" },
      { url: "/stamp/stamp-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    apple: [
      { url: "/stamp/stamp-144.png", sizes: "144x144", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
