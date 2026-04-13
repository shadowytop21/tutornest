import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteFooter() {
  return (
    <footer className="border-t border-borderWarm bg-[rgba(245,247,255,0.75)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/docent-logo.svg" alt="Docent logo" width={220} height={48} className="h-8 w-auto" />
            <div className="text-xl font-bold text-navy font-display">Docent</div>
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-mutedText">
            Trusted local experts for daily life, home, and learning.
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mutedText">Built for local trust, not anonymous listings</p>
        </div>

        <div className="grid gap-3 text-sm text-mutedText sm:grid-cols-2">
          <Link href="/browse" className="transition hover:text-saffron">
            Browse Experts
          </Link>
          {/* Use centralized role-aware join flow so all entry points behave consistently. */}
          <JoinAsTeacherAction className="text-left transition hover:text-saffron">
            Join as Expert
          </JoinAsTeacherAction>
          <Link href="/auth" className="transition hover:text-saffron">
            Login
          </Link>
          <a href="mailto:docentsupport@gmail.com" className="transition hover:text-saffron">
            docentsupport@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
