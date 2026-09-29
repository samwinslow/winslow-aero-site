import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex h-[calc(100vh-73px)] items-center justify-center overflow-hidden text-center">
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
    </main>
  );
}
