"use client";

import { useEffect, useMemo, useState } from "react";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";
import { TeacherCard } from "@/components/teacher-card";
import { useToast } from "@/components/toast-provider";
import {
  availabilityOptions,
  boardOptions,
  computeFilteredTeachers,
  gradeOptions,
  localityOptions,
  subjectOptions,
  teacherSubjects,
  type ReviewRecord,
  type TeacherRecord,
} from "@/lib/data";
import { loadAppState } from "@/lib/mock-db";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const categoryChips = ["All", ...teacherSubjects.slice(0, 6)];
const PAGE_SIZE = 12;

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { pushToast } = useToast();
  const [query, setQuery] = useState(searchParams.get("q") ?? searchParams.get("subject") ?? "");
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "");
  const [grade, setGrade] = useState(searchParams.get("grade") ?? "");
  const [locality, setLocality] = useState(searchParams.get("locality") ?? "");
  const [board, setBoard] = useState(searchParams.get("board") ?? "");
  const [availability, setAvailability] = useState(searchParams.get("availability") ?? "");
  const [priceMax, setPriceMax] = useState(Number(searchParams.get("priceMax") ?? 5000));
  const [mounted, setMounted] = useState(false);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [remoteTeachers, setRemoteTeachers] = useState<TeacherRecord[] | null>(null);
  const [remoteTotal, setRemoteTotal] = useState(0);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setCurrentPage(1); }, [query, subject, grade, locality, board, availability, priceMax]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (currentPage === 1) setCatalogLoaded(false);
      else setIsLoadingMore(true);

      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(PAGE_SIZE));
      if (query) params.set("q", query);
      if (subject) params.set("subject", subject);
      if (grade) params.set("grade", grade);
      if (locality) params.set("locality", locality);
      if (board) params.set("board", board);
      if (availability) params.set("availability", availability);
      if (priceMax < 5000) params.set("priceMax", String(priceMax));

      const res = await fetch(`/api/browse?${params}`, { cache: "no-store" });
      if (!active) return;

      if (!res.ok) {
        if (currentPage === 1) { setRemoteTeachers(null); setRemoteTotal(0); }
        setCatalogLoaded(true); setIsLoadingMore(false); return;
      }

      const payload = await res.json() as { teachers?: TeacherRecord[]; total?: number; offline?: boolean };
      if (payload.offline) {
        if (currentPage === 1) { setRemoteTeachers(null); setRemoteTotal(0); }
        setCatalogLoaded(true); setIsLoadingMore(false); return;
      }

      const incoming = payload.teachers ?? [];
      if (currentPage === 1) {
        setRemoteTeachers(incoming);
      } else {
        setRemoteTeachers((prev) => {
          const map = new Map<string, TeacherRecord>();
          for (const t of [...(prev ?? []), ...incoming]) map.set(t.id, t);
          return Array.from(map.values());
        });
      }
      setRemoteTotal(payload.total ?? 0);
      setCatalogLoaded(true); setIsLoadingMore(false);
    }
    load();
    return () => { active = false; };
  }, [availability, board, currentPage, grade, locality, priceMax, query, subject]);

  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (query) p.set("q", query); else p.delete("q");
    if (subject) p.set("subject", subject); else p.delete("subject");
    if (grade) p.set("grade", grade); else p.delete("grade");
    if (locality) p.set("locality", locality); else p.delete("locality");
    if (board) p.set("board", board); else p.delete("board");
    if (availability) p.set("availability", availability); else p.delete("availability");
    if (priceMax < 5000) p.set("priceMax", String(priceMax)); else p.delete("priceMax");
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [availability, board, grade, locality, pathname, priceMax, query, router, searchParams, subject]);

  const fallbackSnapshot = mounted ? loadAppState() : { teachers: [], reviews: [] as ReviewRecord[] };
  const localTeachers = useMemo(
    () => computeFilteredTeachers(
      fallbackSnapshot.teachers ?? [],
      { query, subject: subject || undefined, grade: grade || undefined, locality: locality || undefined, board: board || undefined, availability: availability || undefined, priceMax, includePending: true },
      fallbackSnapshot.reviews ?? [],
    ),
    [availability, board, fallbackSnapshot.reviews, fallbackSnapshot.teachers, grade, locality, priceMax, query, subject],
  );

  const teachers = remoteTeachers ?? localTeachers.slice(0, currentPage * PAGE_SIZE);
  const totalCount = remoteTeachers !== null ? remoteTotal : localTeachers.length;
  const hasMore = teachers.length < totalCount;
  const hasActiveFilters = Boolean(subject || grade || locality || board || availability || priceMax < 5000);

  function resetFilters() {
    setQuery(""); setSubject(""); setGrade(""); setLocality(""); setBoard(""); setAvailability(""); setPriceMax(5000); setCurrentPage(1);
    pushToast({ tone: "neutral", title: "Filters cleared" });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--foreground)]">Browse Experts</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {catalogLoaded ? `${totalCount} expert${totalCount !== 1 ? "s" : ""} found` : "Loading..."}
          </p>
        </div>
        <JoinAsTeacherAction className="btn-primary shrink-0 px-5 py-2.5 text-sm">
          Join as Expert
        </JoinAsTeacherAction>
      </div>

      {/* Search + chips */}
      <input
        className="field mb-4"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, subject, or locality..."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {categoryChips.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => { setSubject(item === "All" ? "" : item); if (item !== "All") setQuery(item); }}
            className={`pill ${subject === item || (item === "All" && !subject) ? "pill-active" : "pill-inactive"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex gap-6 lg:items-start">

        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="card-surface rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Filters</p>
            <select className="select text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjectOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="select text-sm" value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">All grades</option>
              {gradeOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="select text-sm" value={locality} onChange={(e) => setLocality(e.target.value)}>
              <option value="">All localities</option>
              {localityOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="select text-sm" value={board} onChange={(e) => setBoard(e.target.value)}>
              <option value="">All boards</option>
              {boardOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="select text-sm" value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="">Any availability</option>
              {availabilityOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">Max price: ₹{priceMax}</label>
              <input className="w-full accent-[var(--accent)]" type="range" min="0" max="5000" step="100" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} />
            </div>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="w-full text-center text-xs font-semibold text-[var(--accent)] hover:underline">
                Clear all
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {/* Mobile filter row */}
          <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
            <select className="select flex-1 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Subject</option>
              {subjectOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            <select className="select flex-1 text-sm" value={locality} onChange={(e) => setLocality(e.target.value)}>
              <option value="">Locality</option>
              {localityOptions.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {hasActiveFilters && (
              <button type="button" onClick={resetFilters} className="btn-ghost px-4 py-2 text-sm">Clear</button>
            )}
          </div>

          {!catalogLoaded ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-[var(--border)]" />
              ))}
            </div>
          ) : teachers.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {teachers.map((t) => <TeacherCard key={t.id} teacher={t} />)}
            </div>
          ) : (
            <div className="card-surface rounded-2xl p-10 text-center">
              <p className="text-3xl">🔍</p>
              <h2 className="mt-3 font-display text-xl font-bold text-[var(--foreground)]">No experts found</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">Try adjusting your filters or search term.</p>
              <button type="button" onClick={resetFilters} className="btn-primary mt-5 px-6 py-2.5 text-sm">Clear filters</button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button type="button" className="btn-secondary px-6 py-2.5 text-sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={isLoadingMore}>
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
