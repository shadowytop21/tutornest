import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">404</p>
      <h1 className="mt-4 font-display text-5xl font-light text-[var(--navy)]">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--muted)]">
        This link may be old or incorrect. Use one of these shortcuts to continue.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary px-5 py-2.5 text-sm">Go Home</Link>
        <Link href="/browse" className="btn-secondary px-5 py-2.5 text-sm">Browse Tutors</Link>
        <Link href="/coaching" className="btn-secondary px-5 py-2.5 text-sm">Browse Coaching</Link>
        <Link href="/schools" className="btn-secondary px-5 py-2.5 text-sm">Explore Schools</Link>
      </div>
    </div>
  );
}
