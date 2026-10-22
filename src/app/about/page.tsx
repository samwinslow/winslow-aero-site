import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactButton from "../components/ContactButton";

const description =
  "Commercial pilot and software engineer Sam Winslow's certificates, ratings, and the flying and software services he offers in the SF Bay Area.";

export const metadata: Metadata = {
  title: "About",
  description,
  openGraph: {
    title: "About | winslow.aero",
    description,
    url: "/about",
  },
  twitter: {
    title: "About | winslow.aero",
    description,
  },
};

export default function About() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">About</h1>

      <p className="text-lg">
        I&apos;m Sam Winslow, a pilot based in the San Francisco Bay Area.
        Flying was a first love, but not something I had seriously considered as a career
        until I began taking flying lessons in 2022. I&apos;m so glad I did!
      </p>
      <p className="text-lg">
        I have been lucky to work at several dynamic, fast-growing companies
        from pre-seed to Series B, first as a designer and marketer,
        then as a software engineer, and now mostly as a consultant/advisor.
      </p>
      <p className="text-lg">
        Fast-forward to 2026: Aviation is now my primary focus.
        I am looking for opportunities to grow and give back
        while pursuing my CFI certificate.
        I am also proudly a volunteer pilot for Angel Flight West.
      </p>

      <div className="flex flex-col gap-2">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
          <Image
            src="/IMG_2255.jpeg"
            alt="Sam Winslow"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src="/IMG_5726.jpeg"
              alt="Sam Winslow"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
            <Image
              src="/IMG_5736.jpeg"
              alt="Sam Winslow"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <p className="text-lg">
        I hold the following certificates, ratings, and endorsements:
      </p>

      <ul className="list-disc pl-5 text-lg">
        <li>Commercial Pilot (ASEL, AMEL)</li>
        <li>Advanced, Instrument Ground Instructor (AGI, IGI)</li>
        <li>Instrument Rating</li>
        <li>High Performance Endorsement</li>
        <li>Complex Endorsement</li>
      </ul>
      <ContactButton className="mt-2 self-start" />
    </main>
  );
}
