import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-borderWarm bg-[rgba(250,250,252,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/docent-logo.svg" alt="Docent logo" width={220} height={48} className="h-9 w-auto" priority />
          <div>
            <div className="text-lg font-bold tracking-tight text-navy font-display">Docent</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-saffron">
              Neighbourhood Trust Network
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/browse" className="text-sm font-semibold text-navy transition hover:text-saffron">
            Browse Experts
          </Link>
          {/* Use centralized role-aware join flow so all entry points behave consistently. */}
          <JoinAsTeacherAction className="text-sm font-semibold text-navy transition hover:text-saffron">
            Join as Expert
          </JoinAsTeacherAction>
          <Link href="/auth" className="text-sm font-semibold text-navy transition hover:text-saffron">
            Sign In
          </Link>
        </nav>

        <div className="md:hidden">
          <Link
            href="/browse"
            className="inline-flex h-11 items-center rounded-full bg-saffron px-4 text-sm font-semibold text-white"
          >
            Browse
          </Link>
        </div>
      </div>
    </header>
  );
}
