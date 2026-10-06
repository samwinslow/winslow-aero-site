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

export const metadata: Metadata = {
  title: "winslow.aero | Flying & Software Services, SF Bay Area",
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
