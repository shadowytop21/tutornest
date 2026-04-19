"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";
import { clearSession, loadAppState } from "@/lib/mock-db";
import { loadLiveVerticalCounts, type LiveVerticalCounts } from "@/lib/live-counts";
import { usePathname, useRouter } from "next/navigation";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionRole, setSessionRole] = useState<"teacher" | "parent" | null>(null);
  const [counts, setCounts] = useState<LiveVerticalCounts | null>(null);

  useEffect(() => {
    let active = true;

    const refreshSession = () => {
      const snapshot = loadAppState();
      setSessionName(snapshot.session?.name ?? null);
      setSessionRole(snapshot.session?.role ?? null);
    };

    const refreshCounts = async () => {
      const next = await loadLiveVerticalCounts();
      if (active) setCounts(next);
    };

    refreshSession();
    refreshCounts();

    window.addEventListener("docent-session-change", refreshSession);
    window.addEventListener("docent-coaching-change", refreshCounts);
    window.addEventListener("docent-schools-change", refreshCounts);

    return () => {
      active = false;
      window.removeEventListener("docent-session-change", refreshSession);
      window.removeEventListener("docent-coaching-change", refreshCounts);
      window.removeEventListener("docent-schools-change", refreshCounts);
    };
  }, []);

  function signOut() {
    clearSession();
    setSessionName(null);
    setSessionRole(null);
    router.push("/auth");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(253,250,244,0.96)] backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-decoration-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--saffron)] transition hover:bg-[var(--navy)]">
            <Image src="/docent-mark-v2.png?v=5" alt="Docent logo" width={20} height={20} quality={80} priority className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-[15px] font-medium tracking-[0.08em] text-[var(--navy)]">Docent</div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-[var(--muted2)]">Mathura, UP</div>
          </div>
        </Link>

        <nav className="hidden items-center md:flex">
          <Link href="/browse" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] text-[var(--muted)] hover:bg-[var(--ivory2)] hover:text-[var(--navy)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--saffron)]" />Tutors <span className="rounded-full bg-[var(--ivory3)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted2)]">{counts?.tutors ?? "..."}</span></Link>
          <Link href="/coaching" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] text-[var(--muted)] hover:bg-[var(--ivory2)] hover:text-[var(--navy)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--cobalt)]" />Coaching <span className="rounded-full bg-[var(--ivory3)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted2)]">{counts?.coaching ?? "..."}</span></Link>
          <Link href="/schools" className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] text-[var(--muted)] hover:bg-[var(--ivory2)] hover:text-[var(--navy)]"><span className="h-1.5 w-1.5 rounded-full bg-[var(--teal)]" />Schools <span className="rounded-full bg-[var(--ivory3)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--muted2)]">{counts?.schools ?? "..."}</span></Link>
          <Link href="/company" className="rounded-lg px-4 py-2 text-[13px] text-[var(--muted)] hover:bg-[var(--ivory2)] hover:text-[var(--navy)]">About</Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button type="button" className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--ivory2)] px-3 py-1.5 text-xs text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mathura ▾
          </button>
          {sessionName ? (
            <>
              <Link href={sessionRole === "teacher" ? "/teacher/dashboard" : "/browse"} className="rounded-full border border-[var(--border2)] px-4 py-2 text-[13px] text-[var(--navy)]">Dashboard</Link>
              <button type="button" onClick={signOut} className="rounded-full bg-[var(--navy)] px-5 py-2 text-[13px] text-white">Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth" className="rounded-full border-[1.5px] border-[var(--border2)] px-4 py-2 text-[13px] text-[var(--navy)]">Login</Link>
              <JoinAsTeacherAction className="group relative overflow-hidden rounded-full bg-[var(--navy)] px-5 py-2 text-[13px] text-white">
                <span className="absolute inset-0 -translate-x-full bg-[var(--saffron)] transition duration-300 group-hover:translate-x-0" />
                <span className="relative z-10">Join Free →</span>
              </JoinAsTeacherAction>
            </>
          )}
        </div>
      </div>

      <div className="hidden h-11 items-center border-t border-[var(--border)] bg-white px-4 sm:px-6 lg:flex lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center">
          <Link href="/browse" className={`flex h-11 items-center gap-1.5 px-4 text-[13px] font-medium ${pathname.startsWith("/browse") ? "border-b-2 border-[var(--saffron)] text-[var(--saffron)]" : "text-[var(--muted)]"}`}>
            📚 Home Tutors <span className="rounded-full bg-[var(--saffron-light)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--saffron)]">{counts?.tutors ?? "..."}</span>
          </Link>
          <div className="mx-1 h-5 w-px bg-[var(--border)]" />
          <Link href="/coaching" className={`flex h-11 items-center gap-1.5 px-4 text-[13px] font-medium ${pathname.startsWith("/coaching") ? "border-b-2 border-[var(--cobalt)] text-[var(--cobalt)]" : "text-[var(--muted)]"}`}>
            🎯 Coaching Institutes <span className="rounded-full bg-[var(--cobalt-light)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--cobalt)]">{counts?.coaching ?? "..."}</span>
          </Link>
          <div className="mx-1 h-5 w-px bg-[var(--border)]" />
          <Link href="/schools" className={`flex h-11 items-center gap-1.5 px-4 text-[13px] font-medium ${pathname.startsWith("/schools") ? "border-b-2 border-[var(--teal)] text-[var(--teal)]" : "text-[var(--muted)]"}`}>
            🏫 Schools <span className="rounded-full bg-[var(--teal-light)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--teal)]">{counts?.schools ?? "..."}</span>
          </Link>
          <JoinAsTeacherAction className="ml-auto rounded-full border border-[var(--border)] bg-[var(--ivory2)] px-3 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--border2)] hover:text-[var(--navy)]">+ List Your Institute</JoinAsTeacherAction>
        </div>
      </div>
    </header>
  );
}
