export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-6 py-6 text-sm text-black/60">
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <p>&copy; {new Date().getFullYear()} Sam Winslow</p>
        <p>
          Notice: I am unable to accommodate requests to fly passengers or
          cargo for hire, and do not act as an &ldquo;air carrier&rdquo; or
          furnish charter services as defined by DOT and FAA regulations.
        </p>
      </div>
    </footer>
  );
}
