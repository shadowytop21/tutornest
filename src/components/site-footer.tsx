import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/docent-mark-v2.png?v=4" alt="Docent" width={96} height={96} quality={80} loading="lazy" className="h-8 w-auto" />
              <span className="font-display text-lg font-bold text-navy">Docent</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">
              Verified local experts for every need — starting with Mathura.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 text-sm text-[var(--muted)]">
            <Link href="/browse" className="hover:text-[var(--accent)] transition-colors">Browse Experts</Link>
            <JoinAsTeacherAction className="text-left hover:text-[var(--accent)] transition-colors">Join as Expert</JoinAsTeacherAction>
            <Link href="/auth" className="hover:text-[var(--accent)] transition-colors">Sign In</Link>
            <a href="mailto:docentsupport@gmail.com" className="hover:text-[var(--accent)] transition-colors">Contact</a>
          </nav>

        </div>

        <p className="mt-8 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]">
          © {new Date().getFullYear()} Docent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
