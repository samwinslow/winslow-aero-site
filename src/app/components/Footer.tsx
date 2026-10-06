export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-6 py-6 text-sm text-black/60">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <p>&copy; {new Date().getFullYear()} Sam Winslow</p>
        <p>
          Notice: I do not act as an &ldquo;air carrier&rdquo; or
          offer/furnish charter services as defined by FAA regulations.
        </p>
      </div>
    </footer>
  );
}
