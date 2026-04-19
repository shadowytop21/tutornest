"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { seedCoachingInstitutes, type CoachingInstitute } from "@/lib/verticals-data";
import { listCustomCoachingInstitutes } from "@/lib/verticals-store";

type SortOption = "best" | "fee-asc" | "fee-desc" | "rating" | "newest";

type BatchFilter = "all" | "small" | "medium" | "large";

const examChips = ["JEE", "NEET", "Boards", "Foundation", "Olympiad"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function matchesExamChip(institute: CoachingInstitute, chip: string) {
  if (chip === "JEE") {
    return institute.examTypes.some((item) => item.includes("JEE"));
  }
  if (chip === "NEET") {
    return institute.examTypes.some((item) => item.includes("NEET"));
  }
  if (chip === "Boards") {
    return institute.examTypes.some((item) => item.includes("Boards"));
  }
  if (chip === "Foundation") {
    return institute.examTypes.some((item) => item.includes("Foundation"));
  }
  if (chip === "Olympiad") {
    return institute.examTypes.some((item) => item.includes("Olympiad"));
  }
  return true;
}

function matchesBatch(institute: CoachingInstitute, batchFilter: BatchFilter) {
  if (batchFilter === "all") return true;
  if (batchFilter === "small") return institute.batchSizeMax < 30;
  if (batchFilter === "medium") return institute.batchSizeMin >= 30 && institute.batchSizeMax <= 60;
  return institute.batchSizeMin > 60;
}

export default function CoachingBrowsePage() {
  const [query, setQuery] = useState("");
  const [chipFilter, setChipFilter] = useState<(typeof examChips)[number] | "All">("All");
  const [sidebarExam, setSidebarExam] = useState<string>("All");
  const [customInstitutes, setCustomInstitutes] = useState<CoachingInstitute[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("best");
  const [minFee, setMinFee] = useState(20000);
  const [maxFee, setMaxFee] = useState(150000);
  const [ratingFloor, setRatingFloor] = useState(0);
  const [batchFilter, setBatchFilter] = useState<BatchFilter>("all");

  useEffect(() => {
    const load = () => setCustomInstitutes(listCustomCoachingInstitutes());
    load();
    window.addEventListener("docent-coaching-change", load);
    return () => window.removeEventListener("docent-coaching-change", load);
  }, []);

  const visibleInstitutes = useMemo(() => {
    const merged = [...customInstitutes, ...seedCoachingInstitutes].filter((item) => item.status === "verified");

    const filtered = merged.filter((item) => {
      const searchPool = [item.name, item.tagline, item.locality, ...item.examTypes, ...item.courses.map((course) => course.name)].join(" ").toLowerCase();
      const matchesQuery = !query.trim() || searchPool.includes(query.trim().toLowerCase());
      const matchesTopChip = chipFilter === "All" || matchesExamChip(item, chipFilter);
      const matchesSidebarExam = sidebarExam === "All" || item.examTypes.includes(sidebarExam as (typeof item.examTypes)[number]);
      const matchesFee = item.feeRangeMin >= minFee && item.feeRangeMax <= maxFee;
      const matchesRating = item.rating >= ratingFloor;
      const matchesBatchSize = matchesBatch(item, batchFilter);

      return matchesQuery && matchesTopChip && matchesSidebarExam && matchesFee && matchesRating && matchesBatchSize;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "fee-asc") return a.feeRangeMin - b.feeRangeMin;
      if (sortBy === "fee-desc") return b.feeRangeMin - a.feeRangeMin;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

      const featuredDelta = Number(b.featured) - Number(a.featured);
      if (featuredDelta !== 0) return featuredDelta;
      return b.rating - a.rating;
    });

    return sorted;
  }, [batchFilter, chipFilter, customInstitutes, maxFee, minFee, query, ratingFloor, sidebarExam, sortBy]);

  const stats = useMemo(() => {
    const institutes = visibleInstitutes.length;
    const examTypes = new Set(visibleInstitutes.flatMap((item) => item.examTypes)).size;
    const avgRating = institutes ? (visibleInstitutes.reduce((acc, item) => acc + item.rating, 0) / institutes).toFixed(1) : "0.0";
    return { institutes, examTypes, avgRating };
  }, [visibleInstitutes]);

  return (
    <div className="w-full bg-[var(--ivory)] pb-12">
      <section className="mx-auto mt-6 w-full max-w-7xl overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[#1E40AF] text-white shadow-[0_14px_48px_rgba(30,64,175,0.24)]">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-end lg:p-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-blue-200">Coaching Institutes - Mathura</p>
            <h1 className="mt-2 font-display text-4xl font-medium leading-tight lg:text-5xl">Find the right coaching for your goal.</h1>
            <div className="mt-5 flex w-full max-w-2xl items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-2">
              <input
                className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-blue-200"
                placeholder="Search coaching institutes, courses, or exams..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#1E40AF]">Search</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-white/10 p-2 text-center lg:min-w-[320px]">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3"><div className="font-display text-2xl">{stats.institutes}</div><div className="text-xs text-blue-100">Institutes</div></div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3"><div className="font-display text-2xl">{stats.examTypes}</div><div className="text-xs text-blue-100">Exam Types</div></div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3"><div className="font-display text-2xl">{stats.avgRating}★</div><div className="text-xs text-blue-100">Avg Rating</div></div>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 w-full max-w-7xl rounded-xl border border-[var(--border)] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setChipFilter("All")} className={`rounded-full border px-4 py-2 text-xs font-medium ${chipFilter === "All" ? "border-[#1E40AF] bg-[#1E40AF] text-white" : "border-[var(--border)] bg-[var(--ivory)] text-[var(--navy)]"}`}>All Exams</button>
          {examChips.map((chip) => (
            <button key={chip} type="button" onClick={() => setChipFilter(chip)} className={`rounded-full border px-4 py-2 text-xs font-medium ${chipFilter === chip ? "border-[#1E40AF] bg-[#1E40AF] text-white" : "border-[var(--border)] bg-[var(--ivory)] text-[var(--navy)]"}`}>
              {chip}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-xs text-[var(--muted)]">
            <span>Sort:</span>
            <select className="select !w-auto" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
              <option value="best">Best Match</option>
              <option value="fee-asc">Fees Low to High</option>
              <option value="fee-desc">Fees High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 grid w-full max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Exam Type</p>
            <div className="mt-2 space-y-1">
              <button type="button" onClick={() => setSidebarExam("All")} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${sidebarExam === "All" ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>All</button>
              {Array.from(new Set(seedCoachingInstitutes.flatMap((item) => item.examTypes))).map((exam) => (
                <button key={exam} type="button" onClick={() => setSidebarExam(exam)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${sidebarExam === exam ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>
                  {exam}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Fee Range</p>
            <div className="mt-3 space-y-2 text-xs text-[var(--muted)]">
              <input type="range" min={20000} max={150000} step={5000} value={minFee} onChange={(event) => setMinFee(Number(event.target.value))} className="w-full" />
              <input type="range" min={20000} max={150000} step={5000} value={maxFee} onChange={(event) => setMaxFee(Number(event.target.value))} className="w-full" />
              <p>{formatCurrency(minFee)} - {formatCurrency(maxFee)}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Rating</p>
            <div className="mt-2 grid gap-1 text-sm">
              {[0, 3.5, 4, 4.5].map((threshold) => (
                <button key={threshold} type="button" onClick={() => setRatingFloor(threshold)} className={`rounded-lg px-3 py-2 text-left ${ratingFloor === threshold ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>
                  {threshold === 0 ? "All Ratings" : `${threshold}+ stars`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Batch Size</p>
            <div className="mt-2 grid gap-1 text-sm">
              <button type="button" onClick={() => setBatchFilter("all")} className={`rounded-lg px-3 py-2 text-left ${batchFilter === "all" ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>All</button>
              <button type="button" onClick={() => setBatchFilter("small")} className={`rounded-lg px-3 py-2 text-left ${batchFilter === "small" ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>Small (under 30)</button>
              <button type="button" onClick={() => setBatchFilter("medium")} className={`rounded-lg px-3 py-2 text-left ${batchFilter === "medium" ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>Medium (30-60)</button>
              <button type="button" onClick={() => setBatchFilter("large")} className={`rounded-lg px-3 py-2 text-left ${batchFilter === "large" ? "bg-blue-50 text-[#1E40AF]" : "text-[var(--navy)] hover:bg-[var(--ivory)]"}`}>Large (60+)</button>
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {visibleInstitutes.map((institute) => (
            <article key={institute.id} className="grid overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(26,39,68,0.07)] md:grid-cols-[190px_1fr_190px]">
              <div className="relative flex items-center justify-center bg-gradient-to-br from-[#1E40AF] to-[#1D4ED8] p-8 text-white">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white font-display text-2xl text-[#1E40AF]">{initials(institute.name)}</div>
                {institute.featured ? <span className="absolute left-3 top-3 rounded-full bg-[var(--saffron)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em]">Featured</span> : null}
              </div>

              <div className="p-5 lg:p-6">
                <h2 className="font-display text-2xl text-[var(--navy)]">{institute.name}</h2>
                <p className="text-sm text-[var(--muted)]">{institute.locality}, Mathura - Est. {institute.establishedYear}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{institute.tagline}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {institute.highlights.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-[#1E40AF]">{tag}</span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {institute.courses.slice(0, 5).map((course) => (
                    <span key={course.id} className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-2.5 py-1 text-[11px] text-[var(--navy)]">{course.name}</span>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-3 text-center lg:grid-cols-4">
                  <div><div className="font-display text-lg text-[var(--navy)]">{institute.students || "-"}</div><div className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">Students</div></div>
                  <div><div className="font-display text-lg text-[var(--navy)]">{institute.iitSelections + institute.neetSelections}</div><div className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">Selections</div></div>
                  <div><div className="font-display text-lg text-[var(--navy)]">{institute.passRate}%</div><div className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">Pass Rate</div></div>
                  <div><div className="font-display text-lg text-[var(--navy)]">{institute.facultyCount}</div><div className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">Faculty</div></div>
                </div>
              </div>

              <div className="flex min-w-[190px] flex-col justify-between border-t border-[var(--border)] p-5 md:border-l md:border-t-0">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">Annual Fee</p>
                  <p className="mt-1 font-display text-3xl text-[var(--navy)]">{formatCurrency(institute.feeRangeMin)}</p>
                  <p className="text-xs text-[var(--muted)]">to {formatCurrency(institute.feeRangeMax)}</p>
                  <p className="mt-3 text-sm font-semibold text-[var(--navy)]">{institute.rating.toFixed(1)}★ <span className="font-normal text-[var(--muted)]">({institute.reviewsCount})</span></p>
                </div>

                <div className="mt-4 space-y-2">
                  <Link href={`/coaching/${institute.id}`} className="btn-primary w-full px-4 py-2.5 text-sm">View Institute</Link>
                  <Link href={`/coaching/${institute.id}#enquire`} className="btn-secondary w-full px-4 py-2.5 text-sm">Enquire</Link>
                </div>
              </div>
            </article>
          ))}

          {visibleInstitutes.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center text-[var(--muted)]">No coaching institutes found. Adjust your filters.</div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
