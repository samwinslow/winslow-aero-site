export default function Contact() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <a
        href="https://linkedin.com/in/sambwinslow/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-medium underline underline-offset-4"
      >
        LinkedIn
      </a>
      <a
        href="mailto:sam@winslow.aero"
        className="text-lg font-medium underline underline-offset-4"
      >
        sam@winslow.aero
      </a>
    </main>
  );
}
