"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VerticalSwitcher } from "@/components/vertical-switcher";
import { loadLiveVerticalCounts, type LiveVerticalCounts } from "@/lib/live-counts";
import {
  defaultHomepageTopPicksConfig,
  loadAppState,
  loadHomepageTopPicksConfig,
  type HomepageTopPickItem,
} from "@/lib/mock-db";
import { seedCoachingInstitutes, seedSchools } from "@/lib/verticals-data";
import { listCustomCoachingInstitutes, listCustomSchools } from "@/lib/verticals-store";

type VerticalKey = "tutors" | "coaching" | "schools";

const heroCopy: Record<VerticalKey, { title: string; subtitle: string; cta: string; href: string }> = {
  tutors: {
    title: "Every step of your child's education, one platform.",
    subtitle: "Discover verified home tutors, compare coaching centres for JEE and NEET, and explore top schools - all hyperlocal to Mathura.",
    cta: "Search Tutors",
    href: "/browse",
  },
  coaching: {
    title: "Compare coaching options with clarity.",
    subtitle: "Check courses, fee range, and outcomes before choosing a coaching institute in Mathura.",
    cta: "Search Coaching",
    href: "/coaching",
  },
  schools: {
    title: "Explore schools with complete details.",
    subtitle: "Shortlist schools using board, location, fee, and facility information in one place.",
    cta: "Search Schools",
    href: "/schools",
  },
};

const locations = [
  { name: "All of Mathura", available: true },
  { name: "Civil Lines", available: true },
  { name: "Vrindavan", available: false },
  { name: "Gokul", available: false },
  { name: "Govardhan", available: false },
  { name: "Banasthali", available: false },
];

function asMeta(left: string, middle: string, right: string): [string, string, string] {
  return [left, middle, right];
}

export default function HomePage() {
  const [counts, setCounts] = useState<LiveVerticalCounts | null>(null);
  const [heroVertical, setHeroVertical] = useState<VerticalKey>("tutors");
  const [featuredVertical, setFeaturedVertical] = useState<VerticalKey>("tutors");
  const [selectedLocation, setSelectedLocation] = useState("All of Mathura");
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [topPickItems, setTopPickItems] = useState<HomepageTopPickItem[]>(defaultHomepageTopPicksConfig.items);

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

  useEffect(() => {
    const mergeWithFallback = (vertical: VerticalKey, dynamicItems: HomepageTopPickItem[]) => {
      const fallback = loadHomepageTopPicksConfig().items.filter((item) => item.vertical === vertical);
      if (dynamicItems.length >= 3) {
        return dynamicItems.slice(0, 3);
      }

      const existingIds = new Set(dynamicItems.map((item) => item.id));
      const fallbackNeeded = fallback.filter((item) => !existingIds.has(item.id)).slice(0, 3 - dynamicItems.length);
      return [...dynamicItems, ...fallbackNeeded].slice(0, 3);
    };

    const loadTopPicks = async () => {
      const fallbackConfig = loadHomepageTopPicksConfig().items;

      let tutorsFromApi: Array<{
        id: string;
        name: string;
        locality: string;
        experience_years: number;
        subjects: string[];
        grades: string[];
        boards: string[];
        teaches_at: string;
        price_per_month: number;
        rating: number;
        reviewCount?: number;
        reviews_count?: number;
        is_founding_member?: boolean;
      }> = [];

      try {
        const response = await fetch("/api/browse?limit=30", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as { teachers?: typeof tutorsFromApi };
          tutorsFromApi = payload.teachers ?? [];
        }
      } catch {
        tutorsFromApi = [];
      }

      const localTeachers = loadAppState().teachers
        .filter((teacher) => teacher.status === "verified")
        .map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          locality: teacher.locality,
          experience_years: teacher.experience_years,
          subjects: teacher.subjects,
          grades: teacher.grades,
          boards: teacher.boards,
          teaches_at: teacher.teaches_at,
          price_per_month: teacher.price_per_month,
          rating: teacher.rating,
          reviewCount: teacher.reviewCount,
          reviews_count: teacher.reviews_count,
          is_founding_member: teacher.is_founding_member,
        }));

      const tutorSource = tutorsFromApi.length ? tutorsFromApi : localTeachers;
      const tutorDynamic: HomepageTopPickItem[] = [...tutorSource]
        .sort((a, b) => {
          const aPinned = Boolean(a.is_founding_member);
          const bPinned = Boolean(b.is_founding_member);
          if (aPinned !== bPinned) {
            return aPinned ? -1 : 1;
          }

          return (b.rating ?? 0) - (a.rating ?? 0);
        })
        .slice(0, 3)
        .map((teacher): HomepageTopPickItem => ({
          id: `teacher-${teacher.id}`,
          vertical: "tutors" as const,
          title: teacher.name,
          subtitle: `${teacher.locality} · ${teacher.experience_years || 0} yrs`,
          badges: [teacher.is_founding_member ? "Top Pick" : "Verified", "Tutor"],
          pills: teacher.subjects.slice(0, 3),
          meta: asMeta(
            teacher.grades[0] || "All grades",
            teacher.boards[0] || "All boards",
            teacher.teaches_at === "both" ? "Both homes" : teacher.teaches_at === "teacher_home" ? "Teacher home" : "Student home",
          ),
          price: `₹${(teacher.price_per_month || 0).toLocaleString("en-IN")} /mo`,
          stat: `${teacher.rating ? teacher.rating.toFixed(1) : "New"} (${teacher.reviewCount ?? teacher.reviews_count ?? 0})`,
          href: "/browse",
        }));

      const allCoaching = [...listCustomCoachingInstitutes(), ...seedCoachingInstitutes];
      const coachingDynamic: HomepageTopPickItem[] = allCoaching
        .filter((item) => item.status === "verified")
        .sort((a, b) => {
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          return (b.students || 0) - (a.students || 0);
        })
        .slice(0, 3)
        .map((item): HomepageTopPickItem => ({
          id: `coaching-${item.id}`,
          vertical: "coaching" as const,
          title: item.name,
          subtitle: `${item.locality} · Est. ${item.establishedYear}`,
          badges: [item.featured ? "Top Pick" : "Verified", "Institute"],
          pills: item.examTypes.slice(0, 3),
          meta: asMeta(
            `${item.students.toLocaleString("en-IN")} students`,
            `${item.facultyCount} faculty`,
            `${item.passRate}% success`,
          ),
          price: `₹${item.feeRangeMin.toLocaleString("en-IN")} - ₹${item.feeRangeMax.toLocaleString("en-IN")} /yr`,
          stat: `${item.rating ? item.rating.toFixed(1) : "Profile"} (${item.reviewsCount || 0})`,
          href: `/coaching/${item.id}`,
        }));

      const allSchools = [...listCustomSchools(), ...seedSchools];
      const schoolDynamic: HomepageTopPickItem[] = allSchools
        .filter((item) => item.status === "verified")
        .sort((a, b) => {
          if (a.featured !== b.featured) {
            return a.featured ? -1 : 1;
          }
          return (b.students || 0) - (a.students || 0);
        })
        .slice(0, 3)
        .map((item): HomepageTopPickItem => ({
          id: `school-${item.id}`,
          vertical: "schools" as const,
          title: item.name,
          subtitle: `${item.locality} · ${item.boards.join("/")}`,
          badges: [item.featured ? "Top Pick" : "Verified", "School"],
          pills: item.boards.slice(0, 3),
          meta: asMeta(
            `${item.students.toLocaleString("en-IN")} students`,
            `${item.teachers.toLocaleString("en-IN")} teachers`,
            item.admissionOpen ? "Admissions open" : "Admissions closed",
          ),
          price: `₹${item.annualFeeMin.toLocaleString("en-IN")} - ₹${item.annualFeeMax.toLocaleString("en-IN")} /yr`,
          stat: `${item.rating ? item.rating.toFixed(1) : "Profile"} (${item.reviewsCount || 0})`,
          href: `/schools/${item.id}`,
        }));

      const tutorFinal = mergeWithFallback("tutors", tutorDynamic.length ? tutorDynamic : fallbackConfig.filter((item) => item.vertical === "tutors").slice(0, 3));
      const coachingFinal = mergeWithFallback("coaching", coachingDynamic.length ? coachingDynamic : fallbackConfig.filter((item) => item.vertical === "coaching").slice(0, 3));
      const schoolFinal = mergeWithFallback("schools", schoolDynamic.length ? schoolDynamic : fallbackConfig.filter((item) => item.vertical === "schools").slice(0, 3));

      setTopPickItems([...tutorFinal, ...coachingFinal, ...schoolFinal]);
    };

    void loadTopPicks();
    window.addEventListener("docent-homepage-top-picks-change", loadTopPicks);
    window.addEventListener("docent-session-change", loadTopPicks);
    window.addEventListener("docent-coaching-change", loadTopPicks);
    window.addEventListener("docent-schools-change", loadTopPicks);

    return () => {
      window.removeEventListener("docent-homepage-top-picks-change", loadTopPicks);
      window.removeEventListener("docent-session-change", loadTopPicks);
      window.removeEventListener("docent-coaching-change", loadTopPicks);
      window.removeEventListener("docent-schools-change", loadTopPicks);
    };
  }, []);

  const featuredItems = useMemo(() => {
    return topPickItems.filter((item) => item.vertical === featuredVertical).slice(0, 3);
  }, [featuredVertical, topPickItems]);

  return (
    <div>
      <VerticalSwitcher />

      <div className="page-section">
        <section className="min-h-[88vh]">
          <div className="relative overflow-hidden px-6 py-16 lg:px-12">
            <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full border border-[var(--border)]" />
            <div className="absolute right-16 top-0 h-56 w-56 rounded-full border border-[var(--border)]" />

            <div className="relative z-10 max-w-5xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Tutors · Coaching · Schools in Mathura</p>
              <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] text-[var(--navy)] lg:text-7xl">
                {heroCopy[heroVertical].title.split("education").length > 1 ? (
                  <>
                    Every step of your<br />
                    child&apos;s <em className="text-[var(--saffron)]">education,</em><br />
                    <span className="relative inline-block">one platform.
                      <span className="absolute bottom-1 left-0 right-0 h-[3px] rounded bg-[var(--saffron-mid)]" />
                    </span>
                  </>
                ) : (
                  heroCopy[heroVertical].title
                )}
              </h1>
              <p className="mt-6 max-w-2xl text-[16px] leading-8 text-[var(--muted)]">{heroCopy[heroVertical].subtitle}</p>

              <form action={heroCopy[heroVertical].href} className="mt-8 overflow-hidden rounded-2xl border-[1.5px] border-[var(--border2)] bg-white shadow-[var(--shadow)]">
                <div className="flex flex-col gap-2 p-2 md:flex-row md:items-center md:gap-0">
                  <input name="query" className="w-full border-0 bg-transparent px-4 py-3 text-sm outline-none md:flex-1" placeholder="Search tutors, coaching, schools..." />
                  <div className="hidden h-8 w-px bg-[var(--border)] md:block" />
                  <div className="relative md:w-64">
                    <button type="button" onClick={() => setShowLocationMenu(!showLocationMenu)} className="w-full border-0 bg-transparent px-4 py-3 text-sm text-left outline-none hover:bg-[var(--ivory2)] transition">
                      {selectedLocation}
                    </button>
                    {showLocationMenu && (
                      <div className="absolute right-0 top-full z-50 mt-1 w-full rounded-xl border border-[var(--border)] bg-white shadow-lg">
                        {locations.map((loc) => (
                          <button
                            key={loc.name}
                            type="button"
                            onClick={() => {
                              if (loc.available) {
                                setSelectedLocation(loc.name);
                                setShowLocationMenu(false);
                              }
                            }}
                            className={`block w-full px-4 py-2 text-left text-sm ${loc.available ? "hover:bg-[var(--ivory2)] cursor-pointer" : "text-[var(--muted2)] cursor-not-allowed"}`}
                          >
                            {loc.name}
                            {!loc.available && <span className="ml-2 text-xs text-[var(--muted2)]">Coming soon</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    <input name="locality" type="hidden" value={selectedLocation} />
                  </div>
                  <button type="submit" className="rounded-xl bg-[var(--saffron)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--saffron-mid)]">Search →</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--ivory2)] px-4 py-3">
                  <span className="text-xs text-[var(--muted2)]">Browse:</span>
                  <button type="button" onClick={() => setHeroVertical("tutors")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "tutors" ? "border-[var(--saffron)] bg-[var(--saffron-light)] text-[var(--saffron)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>Home Tutoring</button>
                  <button type="button" onClick={() => setHeroVertical("coaching")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "coaching" ? "border-[var(--saffron)] bg-[var(--saffron-light)] text-[var(--saffron)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>Coaching Centers</button>
                  <button type="button" onClick={() => setHeroVertical("schools")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "schools" ? "border-[var(--saffron)] bg-[var(--saffron-light)] text-[var(--saffron)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>Schools</button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
                <span><span className="font-display text-xl text-[var(--navy)]">{counts?.tutors ?? "..."}</span> Tutors</span>
                <span className="h-4 w-px bg-[var(--border2)]" />
                <span><span className="font-display text-xl text-[var(--navy)]">{counts?.coaching ?? "..."}</span> Institutes</span>
                <span className="h-4 w-px bg-[var(--border2)]" />
                <span><span className="font-display text-xl text-[var(--navy)]">{counts?.schools ?? "..."}</span> Schools</span>
              </div>
            </div>
          </div>
        </section>
      </div>



      <div className="page-section">
        <section className="section-padding">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted2)]">Handpicked for you</p>
              <h2 className="mt-2 font-display text-5xl font-light leading-tight text-[var(--navy)] lg:text-6xl">Top picks in<br /><em className="text-[var(--saffron)]">Mathura</em></h2>
            </div>
            <Link href={heroCopy[featuredVertical].href} className="text-sm text-[var(--saffron)]">See all listings →</Link>
          </div>

          <div className="mb-6 flex gap-8 border-b-2 border-[var(--border)] text-lg">
            <button type="button" onClick={() => setFeaturedVertical("tutors")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "tutors" ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-transparent text-[var(--muted)]"}`}>Home Tutoring</button>
            <button type="button" onClick={() => setFeaturedVertical("coaching")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "coaching" ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-transparent text-[var(--muted)]"}`}>Coaching Centers</button>
            <button type="button" onClick={() => setFeaturedVertical("schools")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "schools" ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-transparent text-[var(--muted)]"}`}>Schools</button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <article key={item.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--saffron-mid)] hover:shadow-[0_16px_32px_rgba(26,39,68,0.08)]">
                <div className="relative flex h-36 items-end justify-between bg-gradient-to-br from-[var(--saffron-light)] via-white to-[var(--ivory2)] px-5 pb-4">
                  <span className="rounded-full border border-[var(--saffron-mid)] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--saffron)]">Top Pick</span>
                  <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-white/80" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(232,134,10,0.15)_0%,transparent_55%)]" />
                </div>
                <div className="flex flex-col gap-1 px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {item.badges.map((badge) => (
                      <span key={badge} className="inline-block rounded-full border border-[var(--saffron-mid)] bg-[var(--saffron-light)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--saffron)]">{badge}</span>
                    ))}
                  </div>
                  <h3 className="mt-2 font-display text-2xl leading-tight text-[var(--navy)]">{item.title}</h3>
                  <p className="text-sm text-[var(--muted)]">{item.subtitle}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.pills.map((pill) => (
                      <span key={pill} className="inline-block rounded-full border border-[var(--border)] bg-white px-2.5 py-1 text-xs text-[var(--muted)]">{pill}</span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted2)]">
                    {item.meta.map((meta, i) => (
                      <span key={i}>
                        {i > 0 && <span className="mr-1.5">·</span>}
                        {meta}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--ivory)]/40 px-5 py-3">
                  <div>
                    <p className="font-display text-3xl text-[var(--navy)]">{item.price}</p>
                    <p className="text-xs text-[var(--muted)]">Rating {item.stat}</p>
                  </div>
                  <Link href={item.href} className="rounded-full bg-[var(--saffron)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--saffron-mid)]">View Profile →</Link>
                </div>
              </article>
            ))}
            {featuredItems.length === 0 && (
              <article className="col-span-full rounded-2xl border border-[var(--border)] bg-white px-6 py-12 text-center">
                <p className="font-display text-3xl text-[var(--navy)]">No picks available yet</p>
                <p className="mt-2 text-sm text-[var(--muted)]">Use the Admin Panel to add top picks for this category.</p>
              </article>
            )}
          </div>
        </section>
      </div>

      <div className="page-section">
        <section className="bg-[var(--ivory2)] px-6 py-16 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted2)]">Why Docent</p>
              <h2 className="mt-3 font-display text-5xl font-light leading-tight text-[var(--navy)] lg:text-6xl">Built on <em className="text-[var(--saffron)]">trust,</em><br />not traffic.</h2>
              <p className="mt-6 max-w-xl text-[15px] leading-8 text-[var(--muted)]">Docent focuses on quality matches across tutors, coaching and schools for families in Mathura.</p>

              <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)]">
                <div className="bg-white p-5"><p className="font-display text-4xl text-[var(--navy)]">184+</p><p className="mt-1 text-xs text-[var(--muted)]">Listings across verticals</p></div>
                <div className="bg-white p-5"><p className="font-display text-4xl text-[var(--navy)]">3</p><p className="mt-1 text-xs text-[var(--muted)]">Core education verticals</p></div>
                <div className="bg-white p-5"><p className="font-display text-4xl text-[var(--navy)]">4.8★</p><p className="mt-1 text-xs text-[var(--muted)]">Platform rating</p></div>
                <div className="bg-white p-5"><p className="font-display text-4xl text-[var(--navy)]">₹0</p><p className="mt-1 text-xs text-[var(--muted)]">Commission taken</p></div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: "✓", title: "Hyperlocal Coverage", desc: "Every listing focuses on Mathura neighborhoods.", bg: "bg-[var(--saffron-light)]" },
                { icon: "✓", title: "Verified Profiles", desc: "Provider profiles are reviewed before public listing.", bg: "bg-[var(--green-light)]" },
                { icon: "✓", title: "Unified Platform", desc: "Tutors, coaching, and schools available from one place.", bg: "bg-[var(--cobalt-light)]" },
                { icon: "✓", title: "Quality Data", desc: "Clean profiles and structured information for better decisions.", bg: "bg-[#F5F3FF]" },
              ].map((item) => (
                <article key={item.title} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-white p-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${item.bg}`}>{item.icon}</div>
                  <div>
                    <h3 className="font-display text-2xl text-[var(--navy)]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-7 text-[var(--muted)]">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="page-section">
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ivory2)] via-[var(--ivory)] to-[var(--saffron-light)] px-6 py-20 text-center text-[var(--navy)] lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,134,10,0.2)_0%,transparent_58%),radial-gradient(ellipse_at_70%_50%,rgba(26,39,68,0.06)_0%,transparent_60%)]" />
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted2)]">Start for free · no account needed to browse</p>
            <h2 className="mt-4 font-display text-5xl font-light leading-tight lg:text-7xl">Mathura&apos;s best education,<br /><em className="text-[var(--saffron)]">all in one place.</em></h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[var(--muted)]">Find a tutor in minutes, compare coaching centres, explore schools.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/browse" className="rounded-full bg-[var(--saffron)] px-7 py-3 text-sm font-semibold text-white hover:bg-[var(--saffron-mid)] transition">Find a Tutor →</Link>
              <Link href="/coaching" className="rounded-full border border-[var(--border2)] bg-white px-7 py-3 text-sm font-semibold text-[var(--navy)] hover:border-[var(--saffron)] hover:text-[var(--saffron)] transition">Browse Coaching Centers</Link>
              <Link href="/schools" className="rounded-full border border-[var(--border2)] bg-white px-7 py-3 text-sm font-semibold text-[var(--navy)] hover:border-[var(--saffron)] hover:text-[var(--saffron)] transition">Explore Schools</Link>
            </div>

            <div className="mx-auto mt-10 max-w-6xl border-t border-[var(--border)] pt-8">
              <div className="flex flex-wrap items-center justify-center gap-10 text-sm text-[var(--muted)]">
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--saffron)]" />{counts ? `${counts.tutors} Verified Tutors` : "Tutors Loading"}</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--cobalt-mid)]" />{counts ? `${counts.coaching} Coaching Institutes` : "Coaching Loading"}</span>
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[var(--teal-mid)]" />{counts ? `${counts.schools} Schools Listed` : "Schools Loading"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
