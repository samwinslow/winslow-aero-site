import Link from "next/link";

export default function About() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="text-lg">
        I&apos;m Sam Winslow, a software engineer and pilot based
        in the San Francisco Bay Area. I take an uncompromising approach to
        safety and reliability, and my experience at early-stage startups has
        made me flexible and pragmatic.
      </p>
      <p className="text-lg">
        I hold the following certificates, ratings, and endorsements:
      </p>

      <ul className="list-disc pl-5 text-lg">
        <li>Advanced, Instrument Ground Instructor (AGI, IGI)</li>
        <li>Commercial Pilot (ASEL, AMEL)</li>
        <li>Instrument Rating</li>
        <li>High Performance Endorsement</li>
        <li>Complex Endorsement</li>
      </ul>
      <p className="text-lg">
        <Link href="/contact" className="font-medium underline underline-offset-4">
          Contact me
        </Link>{" "}
        for:
      </p>
      <ul className="list-disc pl-5 text-lg">
        <li>Aircraft ferrying</li>
        <li>Ground training</li>
        <li>Flight school or flying club operations assistance</li>
        <li>Partnership or aircraft management</li>
        <li>Web design and software development</li>
        <li>Startup advisement</li>
      </ul>
    </main>
  );
}
