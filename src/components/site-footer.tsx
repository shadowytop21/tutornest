import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[linear-gradient(180deg,#f8f3e8_0%,#f1e8d6_100%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Image src="/docent-mark-v2.png?v=5" alt="Docent logo" width={20} height={20} quality={80} loading="lazy" className="h-5 w-5" />
          <div className="font-mono text-[15px] tracking-[0.08em] text-[var(--navy)]/75">Docent</div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--muted)]">
          <Link href="/browse" className="transition hover:text-[var(--navy)]">Browse Teachers</Link>
          <JoinAsTeacherAction className="transition hover:text-[var(--navy)]">Join as Teacher</JoinAsTeacherAction>
          <Link href="/company" className="transition hover:text-[var(--navy)]">Company</Link>
          <Link href="/company/legal/privacy" className="transition hover:text-[var(--navy)]">Privacy</Link>
          <Link href="/company/legal/terms" className="transition hover:text-[var(--navy)]">Terms</Link>
          <Link href="/company/legal/cookies" className="transition hover:text-[var(--navy)]">Cookies</Link>
          <Link href="/auth" className="transition hover:text-[var(--navy)]">Login</Link>
          <a href="mailto:docentsupport@gmail.com" className="transition hover:text-[var(--navy)]">docentsupport@gmail.com</a>
        </div>

        <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} Docent · Mathura</p>
      </div>
    </footer>
  );
}
