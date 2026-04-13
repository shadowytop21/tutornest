import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

const categories = [
  { name: "Tutors", icon: "📚" },
  { name: "Plumbers", icon: "🔧" },
  { name: "Electricians", icon: "⚡" },
  { name: "Carpenters", icon: "🪚" },
  { name: "Cleaners", icon: "🧹" },
  { name: "Appliance Repair", icon: "🛠️" },
];

const steps = [
  {
    step: "01",
    title: "Search nearby",
    desc: "Filter by service, locality, and budget to find verified experts close to you.",
  },
  {
    step: "02",
    title: "Compare profiles",
    desc: "Review experience, pricing, and ratings before reaching out.",
  },
  {
    step: "03",
    title: "Connect directly",
    desc: "Message the expert and get things done — no middlemen, no lead brokers.",
  },
];

export default function HomePage() {
  return (
    <div className="fade-in">

      {/* ── Hero ── */}
      <section className="hero-shell border-b border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="pill badge-founding">Mathura's Local Expert Network</span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Find trusted local experts<br className="hidden sm:block" /> in your neighbourhood
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">
            Verified tutors, plumbers, electricians, and more — all local, all trusted.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/browse" className="btn-primary px-8 py-3 text-sm">
              Browse Experts
            </Link>
            <JoinAsTeacherAction className="btn-secondary px-8 py-3 text-sm">
              Join as Expert
            </JoinAsTeacherAction>
          </div>

          {/* Category pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.name}
                href={`/browse?q=${encodeURIComponent(c.name)}`}
                className="pill pill-inactive hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                <span>{c.icon}</span> {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">How it works</p>
        <h2 className="mt-3 text-center font-display text-3xl font-bold text-[var(--foreground)]">
          Simple, local, and trust-first
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} className="card-soft rounded-2xl p-6">
              <span className="font-display text-4xl font-extrabold text-[var(--accent)] opacity-30">{s.step}</span>
              <p className="mt-3 font-semibold text-[var(--foreground)]">{s.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-[rgba(238,242,255,0.5)] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-surface flex flex-col gap-6 rounded-2xl p-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">For Providers</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)]">
                Get found by people near you
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Create a free verified profile and start receiving enquiries from your neighbourhood.
              </p>
            </div>
            <JoinAsTeacherAction className="btn-primary shrink-0 px-7 py-3 text-sm">
              Create Expert Profile
            </JoinAsTeacherAction>
          </div>
        </div>
      </section>

    </div>
  );
}
