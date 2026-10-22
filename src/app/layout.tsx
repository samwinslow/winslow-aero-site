import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

const siteDescription =
  "Sam Winslow is a software engineer turned commercial pilot offering ground instruction, aircraft ferrying, and software development services in the San Francisco Bay Area.";

const siteUrl = process.env.DEPLOY_PRIME_URL ?? "https://winslow.aero";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "winslow.aero | Flying & Software Services, SF Bay Area",
    template: "%s | winslow.aero",
  },
  description: siteDescription,
  openGraph: {
    title: "winslow.aero | Flying & Software Services, SF Bay Area",
    description: siteDescription,
    url: "/",
    siteName: "winslow.aero",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "winslow.aero | Flying & Software Services, SF Bay Area",
    description: siteDescription,
    images: ["/og-image.jpg"],
  },
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
    <html lang="en" className={firaSans.variable}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
