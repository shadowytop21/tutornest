"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadLiveVerticalCounts, type LiveVerticalCounts } from "@/lib/live-counts";

function isTutorsPath(pathname: string) {
  return pathname === "/" || pathname.startsWith("/browse") || pathname.startsWith("/teacher");
}

export function VerticalSwitcher() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<LiveVerticalCounts | null>(null);

  const tabClass =
    "inline-flex items-center gap-2 border-b-[3px] px-4 py-3 text-sm font-medium transition";

  const tutorsActive = isTutorsPath(pathname);
  const coachingActive = pathname.startsWith("/coaching");
  const schoolsActive = pathname.startsWith("/schools");

  useEffect(() => {
    let active = true;

    const refreshCounts = async () => {
      const nextCounts = await loadLiveVerticalCounts();
      if (active) {
        setCounts(nextCounts);
      }
    };

    refreshCounts();
    window.addEventListener("docent-session-change", refreshCounts);
    window.addEventListener("docent-coaching-change", refreshCounts);
    window.addEventListener("docent-schools-change", refreshCounts);

    return () => {
      active = false;
      window.removeEventListener("docent-session-change", refreshCounts);
      window.removeEventListener("docent-coaching-change", refreshCounts);
      window.removeEventListener("docent-schools-change", refreshCounts);
    };
  }, []);

  return (
    <div className="border-b border-[var(--border)] bg-white px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center overflow-x-auto">
        <Link
          href="/browse"
          className={`${tabClass} ${tutorsActive ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-transparent text-[var(--muted)] hover:text-[var(--navy)]"}`}
        >
          <span>Browse Tutors</span>
          <span className="rounded-full bg-[var(--ivory2)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">{counts?.tutors ?? "..."}</span>
        </Link>

        <Link
          href="/coaching"
          className={`${tabClass} ${coachingActive ? "border-[#1E40AF] text-[#1E40AF]" : "border-transparent text-[var(--muted)] hover:text-[var(--navy)]"}`}
        >
          <span>Coaching Institutes</span>
          <span className="rounded-full bg-[var(--ivory2)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">{counts?.coaching ?? "..."}</span>
        </Link>

        <Link
          href="/schools"
          className={`${tabClass} ${schoolsActive ? "border-[#0D7377] text-[#0D7377]" : "border-transparent text-[var(--muted)] hover:text-[var(--navy)]"}`}
        >
          <span>Schools</span>
          <span className="rounded-full bg-[var(--ivory2)] px-2 py-0.5 font-mono text-[10px] text-[var(--muted)]">{counts?.schools ?? "..."}</span>
        </Link>
      </div>
    </div>
  );
}
