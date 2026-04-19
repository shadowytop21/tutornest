"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  schoolBoardOptions,
  schoolFacilities,
  seedSchools,
  type SchoolBoard,
  type SchoolFacility,
  type SchoolRecord,
  type SchoolType,
} from "@/lib/verticals-data";
import { listCustomSchools, trackSchoolMetric } from "@/lib/verticals-store";

type ViewMode = "grid" | "list";

const quickFilterChips = ["CBSE", "ICSE", "UP Board", "Day School", "Boarding"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function schoolIsDay(school: SchoolRecord) {
  return !school.facilities.includes("Transport") || school.schoolHours.length > 0;
}

function schoolIsBoarding(school: SchoolRecord) {
  return school.facilities.includes("Canteen") && school.facilities.includes("Sports Ground");
}

export default function SchoolsBrowsePage() {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [quickFilter, setQuickFilter] = useState<(typeof quickFilterChips)[number] | "All">("All");
  const [customSchools, setCustomSchools] = useState<SchoolRecord[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<SchoolBoard[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<SchoolType[]>([]);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<SchoolFacility[]>([]);
  const [compareSchoolIds, setCompareSchoolIds] = useState<string[]>([]);

  useEffect(() => {
    const load = () => setCustomSchools(listCustomSchools());
    load();
    window.addEventListener("docent-schools-change", load);
    return () => window.removeEventListener("docent-schools-change", load);
  }, []);

  const sourceSchools = useMemo(() => {
    const merged = [...customSchools, ...seedSchools].filter((item) => item.status === "verified");
    return merged;
  }, [customSchools]);

  const availableLocalities = useMemo(() => Array.from(new Set(sourceSchools.map((item) => item.locality))).sort(), [sourceSchools]);

  const visibleSchools = useMemo(() => {
    return sourceSchools.filter((school) => {
      const searchPool = [school.name, school.locality, school.schoolType, ...school.boards, ...school.facilities].join(" ").toLowerCase();
      const matchesQuery = !query.trim() || searchPool.includes(query.trim().toLowerCase());

      const matchesQuickFilter =
        quickFilter === "All" ||
        (quickFilter === "Day School" ? schoolIsDay(school) : quickFilter === "Boarding" ? schoolIsBoarding(school) : school.boards.includes(quickFilter as SchoolBoard));

      const matchesBoards = selectedBoards.length === 0 || selectedBoards.some((board) => school.boards.includes(board));
      const matchesTypes = selectedTypes.length === 0 || selectedTypes.includes(school.schoolType);
      const matchesLocality = selectedLocalities.length === 0 || selectedLocalities.includes(school.locality);
      const matchesFacilities = selectedFacilities.length === 0 || selectedFacilities.every((facility) => school.facilities.includes(facility));

      return matchesQuery && matchesQuickFilter && matchesBoards && matchesTypes && matchesLocality && matchesFacilities;
    });
  }, [query, quickFilter, selectedBoards, selectedFacilities, selectedLocalities, selectedTypes, sourceSchools]);

  function toggleCompare(id: string) {
    setCompareSchoolIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 3) {
        return current;
      }
      trackSchoolMetric(id, "saves");
      return [...current, id];
    });
  }

  function toggleBoard(board: SchoolBoard) {
    setSelectedBoards((current) => (current.includes(board) ? current.filter((item) => item !== board) : [...current, board]));
  }

  function toggleType(type: SchoolType) {
    setSelectedTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  }

  function toggleLocality(locality: string) {
    setSelectedLocalities((current) => (current.includes(locality) ? current.filter((item) => item !== locality) : [...current, locality]));
  }

  function toggleFacility(facility: SchoolFacility) {
    setSelectedFacilities((current) => (current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]));
  }

  const compareHref = `/schools/compare?ids=${compareSchoolIds.join(",")}`;

  return (
    <div className="w-full bg-[var(--ivory)] pb-28">
      <section className="mx-auto mt-6 w-full max-w-7xl overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-[#0D7377] text-white shadow-[0_14px_48px_rgba(13,115,119,0.24)]">
        <div className="p-6 lg:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-200">Schools - Mathura</p>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight lg:text-5xl">Find the right school for your child&apos;s future.</h1>
          <div className="mt-5 flex w-full max-w-2xl items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-2">
            <input
              className="w-full bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-teal-200"
              placeholder="Search schools by name, board, locality..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0D7377]">Search</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setQuickFilter("All")} className={`rounded-full border px-4 py-2 text-xs font-medium ${quickFilter === "All" ? "border-white bg-white text-[#0D7377]" : "border-white/40 bg-white/10 text-white"}`}>All</button>
            {quickFilterChips.map((chip) => (
              <button key={chip} type="button" onClick={() => setQuickFilter(chip)} className={`rounded-full border px-4 py-2 text-xs font-medium ${quickFilter === chip ? "border-white bg-white text-[#0D7377]" : "border-white/40 bg-white/10 text-white"}`}>
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto mt-4 w-full max-w-7xl rounded-xl border border-[var(--border)] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--navy)]">Boards</span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--navy)]">Location</span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--navy)]">Fees</span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--navy)]">Facilities</span>
          <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-4 py-2 text-xs font-medium text-[var(--navy)]">Type</span>

          <div className="ml-auto flex items-center rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-1 text-xs">
            <button type="button" onClick={() => setViewMode("grid")} className={`rounded-md px-3 py-1.5 ${viewMode === "grid" ? "bg-white text-[var(--navy)] shadow" : "text-[var(--muted)]"}`}>Grid</button>
            <button type="button" onClick={() => setViewMode("list")} className={`rounded-md px-3 py-1.5 ${viewMode === "list" ? "bg-white text-[var(--navy)] shadow" : "text-[var(--muted)]"}`}>List</button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-4 grid w-full max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Board</p>
            <div className="mt-2 space-y-1">
              {schoolBoardOptions.map((board) => (
                <label key={board} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--navy)] hover:bg-[var(--ivory)]">
                  <input type="checkbox" checked={selectedBoards.includes(board)} onChange={() => toggleBoard(board)} />
                  {board}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">School Type</p>
            <div className="mt-2 space-y-1">
              {(["Co-Education", "Girls Only", "Boys Only"] as SchoolType[]).map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--navy)] hover:bg-[var(--ivory)]">
                  <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Locality</p>
            <div className="mt-2 space-y-1">
              {availableLocalities.map((locality) => (
                <label key={locality} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--navy)] hover:bg-[var(--ivory)]">
                  <input type="checkbox" checked={selectedLocalities.includes(locality)} onChange={() => toggleLocality(locality)} />
                  {locality}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Facilities</p>
            <div className="mt-2 space-y-1">
              {schoolFacilities.map((facility) => (
                <label key={facility} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm text-[var(--navy)] hover:bg-[var(--ivory)]">
                  <input type="checkbox" checked={selectedFacilities.includes(facility)} onChange={() => toggleFacility(facility)} />
                  {facility}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <section className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
          {visibleSchools.map((school) => (
            <article key={school.id} className={`overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-white shadow-[0_8px_24px_rgba(26,39,68,0.07)] ${viewMode === "list" ? "grid md:grid-cols-[1fr_auto]" : ""}`}>
              <div>
                <div className="h-2 bg-gradient-to-r from-[#0D7377] to-[#14B8A6]" />
                <div className="border-b border-[var(--border)] p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-50 font-display text-lg text-[#0D7377]">{initials(school.name)}</div>
                    <div>
                      <h2 className="font-display text-xl text-[var(--navy)]">{school.name}</h2>
                      <p className="text-xs text-[var(--muted)]">{school.locality}, Mathura</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-[#0D7377]">{school.boards.join(" / ")}</span>
                    <span className="rounded-full border border-[var(--border)] bg-[var(--ivory)] px-3 py-1 text-xs text-[var(--muted)]">{school.schoolType}</span>
                    {school.featured ? <span className="rounded-full border border-[var(--saffron)] bg-[var(--saffron-light)] px-3 py-1 text-xs font-medium text-[var(--saffron)]">Featured</span> : null}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-3"><p className="text-xs text-[var(--muted)]">Classes</p><p className="font-medium text-[var(--navy)]">{school.classesRange}</p></div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-3"><p className="text-xs text-[var(--muted)]">Est.</p><p className="font-medium text-[var(--navy)]">{school.establishedYear}</p></div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-3"><p className="text-xs text-[var(--muted)]">Type</p><p className="font-medium text-[var(--navy)]">{school.schoolType}</p></div>
                    <div className="rounded-lg border border-[var(--border)] bg-[var(--ivory)] p-3"><p className="text-xs text-[var(--muted)]">Board</p><p className="font-medium text-[var(--navy)]">{school.boards[0]}</p></div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {school.facilities.slice(0, 4).map((facility) => (
                      <span key={facility} className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] text-[#0D7377]">{facility}</span>
                    ))}
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[var(--navy)]">{school.rating.toFixed(1)}★ <span className="font-normal text-[var(--muted)]">({school.reviewsCount} reviews)</span></p>
                </div>
              </div>

              <div className="flex min-w-[200px] flex-col justify-between border-t border-[var(--border)] p-5 md:border-l md:border-t-0">
                <div>
                  <p className="font-display text-2xl text-[var(--navy)]">{formatCurrency(school.annualFeeMin)}</p>
                  <p className="text-xs text-[var(--muted)]">to {formatCurrency(school.annualFeeMax)} / year</p>
                </div>
                <div className="mt-3 space-y-2">
                  <Link href={`/schools/${school.id}`} className="btn-primary w-full px-4 py-2 text-xs">View School</Link>
                  <button
                    type="button"
                    onClick={() => toggleCompare(school.id)}
                    className={`w-full rounded-full border px-4 py-2 text-xs font-medium ${compareSchoolIds.includes(school.id) ? "border-[#0D7377] bg-teal-50 text-[#0D7377]" : "border-[var(--border)] bg-white text-[var(--navy)]"}`}
                  >
                    {compareSchoolIds.includes(school.id) ? "Added" : "Add to Compare"}
                  </button>
                </div>
              </div>
            </article>
          ))}

          {visibleSchools.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-[var(--border)] bg-white p-10 text-center text-[var(--muted)]">No schools found. Adjust your filters.</div>
          ) : null}
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#0D7377] bg-[var(--navy)]/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/60">Compare</p>
          <div className="flex flex-1 flex-wrap gap-2">
            {compareSchoolIds.map((id) => {
              const school = sourceSchools.find((item) => item.id === id);
              if (!school) return null;
              return (
                <div key={id} className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white">
                  <span className="rounded bg-white px-1.5 py-0.5 text-[#0D7377]">{initials(school.name)}</span>
                  <span>{school.name}</span>
                  <button type="button" onClick={() => toggleCompare(id)} className="text-white/70">x</button>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, 3 - compareSchoolIds.length) }).map((_, index) => (
              <div key={index} className="rounded-lg border border-dashed border-white/25 px-3 py-2 text-xs text-white/50">+ Add School</div>
            ))}
          </div>

          <Link href={compareSchoolIds.length >= 2 ? compareHref : "#"} className={`rounded-full px-5 py-2 text-sm font-semibold ${compareSchoolIds.length >= 2 ? "bg-[#0D7377] text-white" : "bg-white/20 text-white/50 pointer-events-none"}`}>
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}
