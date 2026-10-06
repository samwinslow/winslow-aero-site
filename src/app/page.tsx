import Link from "next/link";

export default function Home() {
  return (
    <main>
      <section
        className="relative flex h-[50vh] min-h-[320px] items-center justify-center overflow-hidden bg-fixed bg-cover bg-center text-center"
        style={{ backgroundImage: "url('/IMG_9163-edit.jpeg')" }}
      >
        <div className="absolute inset-0 bg-black/15" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-white">
          <h1 className="text-5xl font-medium tracking-tight">Sam Winslow</h1>
          <h2 className="text-xl font-semibold tracking-tight">Ground Instruction, Flying and Software Services in the Bay Area</h2>
          <Link
          href="/contact"
          className="mx-auto rounded-md bg-brand-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-blue/80"
        >
          Get in touch
        </Link>
        </div>
      </section>

      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold">Instructional Videos</h2>
        <p className="text-center text-black/70">
          Check out the{" "}
          <a
            href="https://www.youtube.com/playlist?list=PLC7vHIXQ81Ng"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            full playlist
          </a>
          . A great supplement, but not a
          substitute for hands-on flight instruction. New video roughly once per week!
        </p>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src="https://www.youtube.com/embed/videoseries?si=xUtB0NywcNbje1Nt&list=PLC7vHIXQ81Ng"
            title="YouTube video player"
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </section>
    </main>
  );
}
