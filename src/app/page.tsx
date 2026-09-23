import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Image
        src="/pfd.jpeg"
        alt=""
        width={305}
        height={176}
        unoptimized
        className="mb-6"
      />
      <h1 className="text-5xl font-medium tracking-tight">winslow.aero</h1>
      <h2 className="text-xl font-semibold tracking-tight">turning and burning. come back soon!</h2>
    </main>
  );
}
