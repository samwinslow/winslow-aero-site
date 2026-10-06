import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section className="relative flex h-[50vh] min-h-[320px] items-center justify-center overflow-hidden text-center">
        <Image
          src="/IMG_0948.jpeg"
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
          <h1 className="text-5xl font-medium tracking-tight">winslow.aero</h1>
          <h2 className="text-xl font-semibold tracking-tight">turning and burning. site will be ready  soon!</h2>
        </div>
      </section>

      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <h2 className="text-center text-3xl font-semibold">Instructional Videos</h2>
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
