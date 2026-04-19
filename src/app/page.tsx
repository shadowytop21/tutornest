"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { VerticalSwitcher } from "@/components/vertical-switcher";
import { loadLiveVerticalCounts, type LiveVerticalCounts } from "@/lib/live-counts";

type VerticalKey = "tutors" | "coaching" | "schools";

type ListingItem = {
  id: string;
  vertical: VerticalKey;
  title: string;
  subtitle: string;
  badges: string[];
  pills: string[];
  meta: [string, string, string];
  price: string;
  stat: string;
  href: string;
};

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

const howStepsByVertical: Record<VerticalKey, Array<{ title: string; description: string; icon: string }>> = {
  tutors: [
    { title: "Search your locality", description: "Filter by subject, grade, board and price. Every tutor listed is local to Mathura.", icon: "🔍" },
    { title: "Review profiles", description: "Check experience, subjects and availability before deciding.", icon: "👤" },
    { title: "Connect instantly", description: "Reach out directly and continue on WhatsApp in one tap.", icon: "💬" },
  ],
  coaching: [
    { title: "Pick your exam", description: "Choose JEE, NEET, Boards or Foundation to narrow the right institutes.", icon: "🎯" },
    { title: "Compare outcomes", description: "See fee bands, batches, and programs side by side before shortlisting.", icon: "📊" },
    { title: "Send enquiry", description: "Contact the institute directly for counselling and admission support.", icon: "✉️" },
  ],
  schools: [
    { title: "Set your preference", description: "Filter by board, class range, area and annual fee.", icon: "🏫" },
    { title: "Review school profile", description: "Check facilities, class structure and admissions timeline.", icon: "📘" },
    { title: "Apply with confidence", description: "Save your shortlist and reach school admins from one flow.", icon: "✅" },
  ],
};

const listings: ListingItem[] = [
  {
    id: "t1",
    vertical: "tutors",
    title: "Priya Sharma",
    subtitle: "Civil Lines · 7 yrs",
    badges: ["Verified", "Tutor"],
    pills: ["Maths", "Physics"],
    meta: ["Class 9-12", "CBSE", "Both homes"],
    price: "₹1,200 /mo",
    stat: "4.9 (48)",
    href: "/browse",
  },
  {
    id: "t2",
    vertical: "tutors",
    title: "Rahul Mehta",
    subtitle: "Vrindavan · 9 yrs",
    badges: ["Verified", "Tutor"],
    pills: ["Chemistry", "Biology"],
    meta: ["Class 11-12", "CBSE/UP", "My home"],
    price: "₹1,500 /mo",
    stat: "4.8 (61)",
    href: "/browse",
  },
  {
    id: "c1",
    vertical: "coaching",
    title: "Aakash Institute",
    subtitle: "Civil Lines · Est. 2004",
    badges: ["Verified", "Featured"],
    pills: ["JEE", "NEET", "Foundation"],
    meta: ["2,400+ students", "340 IIT", "98%"],
    price: "₹85,000 /yr",
    stat: "4.8 (124)",
    href: "/coaching",
  },
  {
    id: "s1",
    vertical: "schools",
    title: "Springfield School",
    subtitle: "Dampier Nagar · CBSE",
    badges: ["Profile", "School"],
    pills: ["CBSE", "K-12", "STEM"],
    meta: ["1800 students", "Smart labs", "Admissions open"],
    price: "₹42,000 /yr",
    stat: "Campus profile",
    href: "/schools",
  },
];

export default function HomePage() {
  const [counts, setCounts] = useState<LiveVerticalCounts | null>(null);
  const [heroVertical, setHeroVertical] = useState<VerticalKey>("tutors");
  const [howVertical, setHowVertical] = useState<VerticalKey>("tutors");
  const [featuredVertical, setFeaturedVertical] = useState<VerticalKey>("tutors");

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

  const featuredItems = useMemo(() => {
    const selected = listings.filter((item) => item.vertical === featuredVertical);
    if (selected.length >= 3) return selected.slice(0, 3);
    const remainder = listings.filter((item) => item.vertical !== featuredVertical);
    return [...selected, ...remainder].slice(0, 3);
  }, [featuredVertical]);

  return (
    <div>
      <VerticalSwitcher />

      <div className="page-section">
        <section className="grid min-h-[88vh] grid-cols-1 lg:grid-cols-[1fr_480px]">
          <div className="relative overflow-hidden px-6 py-16 lg:px-12">
            <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full border border-[var(--border)]" />
            <div className="absolute right-16 top-0 h-56 w-56 rounded-full border border-[var(--border)]" />

            <div className="relative z-10 max-w-3xl">
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
                  <input name="locality" className="w-full border-0 bg-transparent px-4 py-3 text-sm outline-none md:w-64" placeholder="All of Mathura" />
                  <button type="submit" className="rounded-xl bg-[var(--navy)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--saffron)]">Search →</button>
                </div>
                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--ivory2)] px-4 py-3">
                  <span className="text-xs text-[var(--muted2)]">Browse:</span>
                  <button type="button" onClick={() => setHeroVertical("tutors")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "tutors" ? "border-[rgba(232,134,10,0.3)] bg-[var(--saffron-light)] text-[var(--saffron)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>📚 Tutors</button>
                  <button type="button" onClick={() => setHeroVertical("coaching")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "coaching" ? "border-[rgba(30,64,175,0.25)] bg-[var(--cobalt-light)] text-[var(--cobalt)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>🎯 Coaching</button>
                  <button type="button" onClick={() => setHeroVertical("schools")} className={`rounded-full border px-3 py-1 text-xs font-medium ${heroVertical === "schools" ? "border-[rgba(13,115,119,0.25)] bg-[var(--teal-light)] text-[var(--teal)]" : "border-[var(--border)] bg-white text-[var(--muted)]"}`}>🏫 Schools</button>
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

          <div className="border-l border-[var(--border)] bg-[linear-gradient(180deg,#f6f1e4_0%,#efe5cf_100%)] p-6">
            {[
              {
                key: "tutors" as const,
                title: "Home Tutors",
                desc: "Verified local tutors for every subject, grade and board.",
                count: counts ? `${counts.tutors} tutors in Mathura` : "Loading tutors...",
                href: "/browse",
                icon: "📚",
                color: "text-[var(--saffron)]",
                bg: "bg-[var(--saffron-light)]",
              },
              {
                key: "coaching" as const,
                title: "Coaching Institutes",
                desc: "Compare JEE, NEET and board coaching centres.",
                count: counts ? `${counts.coaching} institutes listed` : "Loading coaching...",
                href: "/coaching",
                icon: "🎯",
                color: "text-[var(--cobalt)]",
                bg: "bg-[var(--cobalt-light)]",
              },
              {
                key: "schools" as const,
                title: "Schools",
                desc: "Explore schools with fees, facilities and admission status.",
                count: counts ? `${counts.schools} schools listed` : "Loading schools...",
                href: "/schools",
                icon: "🏫",
                color: "text-[var(--teal)]",
                bg: "bg-[var(--teal-light)]",
              },
            ].map((panel) => (
              <Link key={panel.key} href={panel.href} className="group mb-4 flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white/70 p-5 transition hover:translate-x-1">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${panel.bg}`}>{panel.icon}</div>
                <div className="flex-1">
                  <p className="font-display text-2xl text-[var(--navy)]">{panel.title}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">{panel.desc}</p>
                  <p className={`mt-2 text-[11px] font-medium ${panel.color}`}>Live Now · {panel.count}</p>
                </div>
                <span className="text-xl text-[var(--muted2)] transition group-hover:text-[var(--navy)] group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="page-section" id="how-it-works">
        <section className="relative overflow-hidden bg-[var(--navy)] px-6 py-16 text-white lg:px-12">
          <div className="absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(232,134,10,0.15)_0%,transparent_70%)]" />
          <div className="relative z-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">How it works</p>
                <h2 className="mt-2 font-display text-5xl font-light leading-tight lg:text-6xl">Simple by design,<br /><em className="text-[var(--saffron-mid)]">powerful by results.</em></h2>
              </div>
              <p className="max-w-sm text-sm leading-7 text-white/50">Each vertical has its own flow designed around how families compare options in practice.</p>
            </div>

            <div className="mb-8 inline-flex overflow-hidden rounded-xl border border-white/15 bg-white/5">
              <button type="button" onClick={() => setHowVertical("tutors")} className={`px-5 py-2.5 text-sm ${howVertical === "tutors" ? "bg-[rgba(232,134,10,0.2)] text-[var(--saffron-mid)]" : "text-white/60"}`}>📚 For Tutors</button>
              <button type="button" onClick={() => setHowVertical("coaching")} className={`px-5 py-2.5 text-sm ${howVertical === "coaching" ? "bg-[rgba(30,64,175,0.25)] text-[var(--cobalt-mid)]" : "text-white/60"}`}>🎯 For Coaching</button>
              <button type="button" onClick={() => setHowVertical("schools")} className={`px-5 py-2.5 text-sm ${howVertical === "schools" ? "bg-[rgba(13,115,119,0.25)] text-[var(--teal-mid)]" : "text-white/60"}`}>🏫 For Schools</button>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {howStepsByVertical[howVertical].map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/35">Step {String(index + 1).padStart(2, "0")}</p>
                  <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">{step.icon}</div>
                  <h3 className="mt-4 font-display text-3xl text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/55">{step.description}</p>
                </article>
              ))}
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
            <Link href="/browse" className="text-sm text-[var(--saffron)]">See all listings →</Link>
          </div>

          <div className="mb-6 flex gap-8 border-b-2 border-[var(--border)] text-lg">
            <button type="button" onClick={() => setFeaturedVertical("tutors")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "tutors" ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-transparent text-[var(--muted)]"}`}>📚 Tutors</button>
            <button type="button" onClick={() => setFeaturedVertical("coaching")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "coaching" ? "border-[var(--cobalt)] text-[var(--cobalt)]" : "border-transparent text-[var(--muted)]"}`}>🎯 Coaching</button>
            <button type="button" onClick={() => setFeaturedVertical("schools")} className={`mb-[-2px] border-b-2 pb-2 font-display ${featuredVertical === "schools" ? "border-[var(--teal)] text-[var(--teal)]" : "border-transparent text-[var(--muted)]"}`}>🏫 Schools</button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
                <div className={`h-1.5 ${item.vertical === "coaching" ? "bg-gradient-to-r from-[var(--cobalt)] to-[var(--cobalt-mid)]" : item.vertical === "schools" ? "bg-gradient-to-r from-[var(--teal)] to-[var(--teal-mid)]" : "bg-gradient-to-r from-[var(--saffron)] to-[var(--saffron-mid)]"}`} />
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-lg ${item.vertical === "coaching" ? "bg-[var(--cobalt-light)] text-[var(--cobalt)]" : item.vertical === "schools" ? "bg-[var(--teal-light)] text-[var(--teal)]" : "bg-[var(--saffron-mid)] text-[var(--navy)]"}`}>{item.title.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</div>
                    <div>
                      <p className="font-display text-2xl text-[var(--navy)]">{item.title}</p>
                      <p className="text-xs text-[var(--muted)]">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.badges.map((badge) => (
                      <span key={badge} className="rounded-full border border-[var(--border)] bg-[var(--ivory2)] px-2.5 py-1 text-[10px] text-[var(--navy)]">{badge}</span>
                    ))}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {item.pills.map((pill) => (
                      <span key={pill} className={`rounded-full px-2.5 py-1 text-[10px] ${item.vertical === "coaching" ? "bg-[var(--cobalt-light)] text-[var(--cobalt)]" : item.vertical === "schools" ? "bg-[var(--teal-light)] text-[var(--teal)]" : "bg-[var(--saffron-light)] text-[var(--saffron)]"}`}>{pill}</span>
                    ))}
                  </div>

                  <div className="mb-2 grid grid-cols-3 gap-1 rounded-lg bg-[var(--ivory2)] px-2 py-2 text-[11px] text-[var(--muted)]">
                    <span className="text-center">{item.meta[0]}</span>
                    <span className="text-center">{item.meta[1]}</span>
                    <span className="text-center">{item.meta[2]}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3">
                  <div>
                    <p className="font-display text-3xl text-[var(--navy)]">{item.price}</p>
                    <p className="text-xs text-[var(--muted)]">★ {item.stat}</p>
                  </div>
                  <Link href={item.href} className="rounded-full bg-[var(--navy)] px-4 py-2 text-xs font-semibold text-white">View →</Link>
                </div>
              </article>
            ))}
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
                { icon: "📍", title: "Truly hyperlocal", desc: "Every listing is focused on Mathura neighbourhoods.", bg: "bg-[var(--saffron-light)]" },
                { icon: "✓", title: "Manually reviewed", desc: "Provider profiles are reviewed before public listing.", bg: "bg-[var(--green-light)]" },
                { icon: "🎯", title: "Three verticals, one flow", desc: "Tutors, coaching, and schools available from one account.", bg: "bg-[var(--cobalt-light)]" },
                { icon: "⭐", title: "Quality-first listings", desc: "Clean profiles and structured data for better decisions.", bg: "bg-[#F5F3FF]" },
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
        <section className="relative overflow-hidden bg-[var(--navy3)] px-6 py-20 text-center text-white lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(232,134,10,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_70%_50%,rgba(13,115,119,0.12)_0%,transparent_55%)]" />
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">Start for free · no account needed to browse</p>
            <h2 className="mt-4 font-display text-5xl font-light leading-tight lg:text-7xl">Mathura&apos;s best education,<br /><em className="text-[var(--saffron-mid)]">all in one place.</em></h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-white/65">Find a tutor in minutes, compare coaching centres, explore schools.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/browse" className="rounded-full bg-[var(--saffron)] px-7 py-3 text-sm font-semibold text-white">Find a Tutor →</Link>
              <Link href="/coaching" className="rounded-full border border-[rgba(30,64,175,0.35)] bg-[rgba(30,64,175,0.2)] px-7 py-3 text-sm font-semibold text-[var(--cobalt-mid)]">Browse Coaching 🎯</Link>
              <Link href="/schools" className="rounded-full border border-[rgba(13,115,119,0.35)] bg-[rgba(13,115,119,0.2)] px-7 py-3 text-sm font-semibold text-[var(--teal-mid)]">Explore Schools 🏫</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
