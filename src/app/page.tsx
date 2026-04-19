"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";
import { VerticalSwitcher } from "@/components/vertical-switcher";
import { defaultHomepageShowcaseConfig, loadHomepageShowcaseConfig, type HomepageShowcaseConfig } from "@/lib/mock-db";
import { loadLiveVerticalCounts, type LiveVerticalCounts } from "@/lib/live-counts";

const subjectCards = [
  { name: "Mathematics", count: "24 tutors available" },
  { name: "Science", count: "18 tutors available" },
  { name: "Chemistry", count: "12 tutors available" },
  { name: "Physics", count: "16 tutors available" },
  { name: "English", count: "20 tutors available" },
  { name: "Biology", count: "10 tutors available" },
  { name: "Hindi", count: "22 tutors available" },
  { name: "Computer Sci.", count: "8 tutors available" },
];

const howSteps = [
  {
    title: "Search your locality",
    description: "Filter by subject, grade, board and price.",
  },
  {
    title: "Review verified profiles",
    description: "Check experience, subjects and availability before deciding.",
  },
  {
    title: "Connect directly",
    description: "Reach out and continue on WhatsApp.",
  },
];

const whyItems = [
  {
    icon: "LOC",
    iconClass: "wi-saffron",
    title: "Truly hyperlocal",
    description: "Every tutor is listed with area details for practical matching.",
  },
  {
    icon: "DOC",
    iconClass: "wi-green",
    title: "Manually verified",
    description: "Teacher documents are reviewed before public listing.",
  },
  {
    icon: "FEE",
    iconClass: "wi-blue",
    title: "Zero commission",
    description: "Docent does not deduct commissions from parents or teachers.",
  },
  {
    icon: "REV",
    iconClass: "wi-purple",
    title: "Real reviews only",
    description: "Review access is tied to signed-in accounts.",
  },
];

export default function HomePage() {
  const [showcase, setShowcase] = useState<HomepageShowcaseConfig>(defaultHomepageShowcaseConfig);
  const [counts, setCounts] = useState<LiveVerticalCounts | null>(null);

  useEffect(() => {
    setShowcase(loadHomepageShowcaseConfig());
  }, []);

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

  function subjectQuery(subjectName: string) {
    if (subjectName === "Mathematics") return "Maths";
    if (subjectName === "Computer Sci.") return "Computer Science";
    return subjectName;
  }

  return (
    <div>
      <VerticalSwitcher />

      <section className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--ivory)] p-6 shadow-[0_8px_28px_rgba(26,39,68,0.08)] lg:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">What are you looking for?</p>
            <h1 className="mt-4 font-display text-4xl font-light leading-tight text-[var(--navy)] lg:text-6xl">
              Find the right <em className="text-[var(--saffron)]">education</em>
              <br />for your child.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[var(--muted)]">
              Docent covers every stage of the journey from local tutors to coaching institutes and schools.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Link href="/browse" className="group rounded-3xl border-2 border-[var(--border)] bg-white p-6 transition hover:-translate-y-1 hover:border-[var(--saffron)] hover:shadow-[0_12px_32px_rgba(26,39,68,0.12)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--saffron-light)] text-xl">📚</div>
              <h2 className="font-display text-2xl text-[var(--navy)]">Home Tutors</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Find verified tutors near your locality by subject, grade, board, and monthly budget.</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-[var(--green-light)] px-3 py-1 text-[11px] font-semibold text-[var(--green)]">Live</span>
                <span className="text-xs text-[var(--muted)]">{counts ? `${counts.tutors} tutors in Mathura` : "Loading tutors..."}</span>
              </div>
            </Link>

            <Link href="/coaching" className="group rounded-3xl border-2 border-[var(--border)] bg-white p-6 transition hover:-translate-y-1 hover:border-[#1E40AF] hover:shadow-[0_12px_32px_rgba(30,64,175,0.16)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl">🎯</div>
              <h2 className="font-display text-2xl text-[var(--navy)]">Coaching Institutes</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Compare JEE, NEET, and board coaching with fee ranges, courses, and result signals.</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-[var(--green-light)] px-3 py-1 text-[11px] font-semibold text-[var(--green)]">Live</span>
                <span className="text-xs text-[var(--muted)]">{counts ? `${counts.coaching} institutes listed` : "Loading institutes..."}</span>
              </div>
            </Link>

            <Link href="/schools" className="group rounded-3xl border-2 border-[var(--border)] bg-white p-6 transition hover:-translate-y-1 hover:border-[#0D7377] hover:shadow-[0_12px_32px_rgba(13,115,119,0.16)]">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-xl">🏫</div>
              <h2 className="font-display text-2xl text-[var(--navy)]">Schools</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">Browse schools by board, location, and annual fees with side-by-side profile insights.</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-[var(--green-light)] px-3 py-1 text-[11px] font-semibold text-[var(--green)]">Live</span>
                <span className="text-xs text-[var(--muted)]">{counts ? `${counts.schools} schools listed` : "Loading schools..."}</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <div className="page-section">
        <section className="hero">
          <div className="hero-accent" />
          <div className="hero-accent2" />

          <div className="hero-left">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span>Hyperlocal · Verified · Trusted in Mathura</span>
            </div>

            <h1 className="hero-headline">
              Find the <em>right</em><br />
              home tutor <span className="underline-word">near</span><br />
              you.
            </h1>

            <p className="hero-sub">
              Docent helps families discover local tutors filtered by subject, grade, locality, and budget.
            </p>

            <form action="/browse" className="hero-search">
              <input name="subject" className="search-field" placeholder="What subject?" />
              <div className="search-divider" />
              <input name="locality" className="search-field" placeholder="Which area?" />
              <button type="submit" className="search-btn">Find Tutors</button>
            </form>

            <div className="hero-tags">
              <span>Popular:</span>
              <span className="tag">Maths Class 10</span>
              <span className="tag">Physics JEE</span>
              <span className="tag">English CBSE</span>
              <span className="tag">Hindi UP Board</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-right-label">Featured Today</div>

            <div className="featured-card">
              <div className="featured-card-top">
                <div className="teacher-avatar">{showcase.cards[0]?.initials ?? "NA"}</div>
                <div className="teacher-meta">
                  <h4>{showcase.cards[0]?.name ?? "Teacher"}</h4>
                  <p>{showcase.cards[0]?.locality ?? "Mathura"}</p>
                </div>
              </div>
              <div className="featured-card-pills">
                {(showcase.cards[0]?.tags ?? []).map((tag) => (
                  <span key={tag} className="pill">{tag}</span>
                ))}
              </div>
              <div className="featured-card-footer">
                <div className="price">₹{showcase.cards[0]?.price ?? 0} <span>/ month</span></div>
                <div className="rating">
                  <span className="rating-star">Rating</span>
                  <span className="rating-val">{(showcase.cards[0]?.rating ?? 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="featured-card">
              <div className="featured-card-top">
                <div className="teacher-avatar green">{showcase.cards[1]?.initials ?? "NA"}</div>
                <div className="teacher-meta">
                  <h4>{showcase.cards[1]?.name ?? "Teacher"}</h4>
                  <p>{showcase.cards[1]?.locality ?? "Mathura"}</p>
                </div>
              </div>
              <div className="featured-card-pills">
                {(showcase.cards[1]?.tags ?? []).map((tag) => (
                  <span key={tag} className="pill">{tag}</span>
                ))}
              </div>
              <div className="featured-card-footer">
                <div className="price">₹{showcase.cards[1]?.price ?? 0} <span>/ month</span></div>
                <div className="rating">
                  <span className="rating-star">Rating</span>
                  <span className="rating-val">{(showcase.cards[1]?.rating ?? 0).toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="hero-stats">
              {(showcase.stats ?? []).map((item) => (
                <div key={item.label} className="stat-item">
                  <span className="stat-num">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="page-section" id="subjects">
        <div className="subjects-section">
          <p className="section-eyebrow">Browse by subject</p>
          <h2 className="subjects-title">Every subject,<br /><em>one platform.</em></h2>
          <p className="subjects-sub">Click any subject to see available tutors in your area</p>
          <div className="subjects-grid">
            {subjectCards.map((item) => (
              <Link key={item.name} href={`/browse?subject=${encodeURIComponent(subjectQuery(item.name))}`} className="subject-card">
                <div className="subject-name">{item.name}</div>
                <div className="subject-count">{item.count}</div>
                <div className="subject-arrow">View</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="page-section" id="how-it-works">
        <div className="section-padding">
          <div className="how-grid">
            <div>
              <p className="section-eyebrow">For parents</p>
              <h2 className="section-title">As easy as asking<br />a <em>neighbour.</em></h2>
              <p className="mt-6 max-w-[420px] text-[15px] leading-8 text-[var(--muted)]">Find, compare, and contact tutors without broker calls.</p>
            </div>
            <div className="how-steps">
              {howSteps.map((step, index) => (
                <div key={step.title} className="how-step">
                  <div className="step-num-box">{index + 1}</div>
                  <div>
                    <div className="step-title">{step.title}</div>
                    <div className="step-desc">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="why-section">
          <div>
            <p className="section-eyebrow">Why Docent</p>
            <h2 className="section-title">Built on<br /><em>trust,</em><br />not traffic.</h2>
            <p className="mt-6 max-w-[400px] text-[15px] leading-8 text-[var(--muted)]">Focused on quality matches and verified listings.</p>
          </div>
          <div className="why-features">
            {whyItems.map((item) => (
              <div key={item.title} className="why-feature">
                <div className={`why-icon ${item.iconClass}`}>{item.icon}</div>
                <div>
                  <div className="why-feature-title">{item.title}</div>
                  <div className="why-feature-desc">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-section">
        <section className="cta-section">
          <h2 className="cta-title">Your child&apos;s best<br />tutor is <em>already</em><br />in your society.</h2>
          <p className="cta-sub">Find tutors by subject, area and availability.</p>
          <div className="cta-buttons">
            <Link href="/browse" className="btn-cta-primary">Find a Tutor Now</Link>
            <JoinAsTeacherAction className="btn-cta-ghost">Join as Teacher</JoinAsTeacherAction>
          </div>
        </section>
      </div>
    </div>
  );
}
