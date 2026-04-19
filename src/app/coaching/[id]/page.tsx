"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { formatHandle } from "@/lib/handles";
import { seedCoachingInstitutes, type CoachingInstitute } from "@/lib/verticals-data";
import { createCoachingEnquiry, listCustomCoachingInstitutes, trackCoachingMetric } from "@/lib/verticals-store";
import { useToast } from "@/components/toast-provider";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CoachingInstituteProfilePage() {
  const params = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [customInstitutes, setCustomInstitutes] = useState<CoachingInstitute[]>([]);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiry, setEnquiry] = useState({
    name: "",
    phone: "",
    email: "",
    courseInterest: "",
    message: "",
  });

  useEffect(() => {
    const load = () => setCustomInstitutes(listCustomCoachingInstitutes());
    load();
    window.addEventListener("docent-coaching-change", load);
    return () => window.removeEventListener("docent-coaching-change", load);
  }, []);

  const institute = useMemo(() => {
    const merged = [...customInstitutes, ...seedCoachingInstitutes];
    return merged.find((item) => item.id === params.id) ?? null;
  }, [customInstitutes, params.id]);
  const displayHandle = formatHandle(institute?.handle ?? institute?.name);

  useEffect(() => {
    if (!institute) {
      return;
    }

    trackCoachingMetric(institute.id, "profileViews");
  }, [institute]);

  if (!institute) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-[var(--navy)]">Institute not found</h1>
        <p className="mt-3 text-[var(--muted)]">This institute might be unavailable or not yet published.</p>
        <Link href="/coaching" className="btn-primary mt-8 px-6 py-3 text-sm">Back to Coaching Browse</Link>
      </div>
    );
  }

  function submitEnquiry() {
    if (!institute) {
      return;
    }

    if (!enquiry.name.trim() || !enquiry.phone.trim() || !enquiry.email.trim() || !enquiry.courseInterest.trim()) {
      pushToast({ tone: "error", title: "Please complete all required enquiry fields" });
      return;
    }

    createCoachingEnquiry({
      instituteId: institute.id,
      instituteName: institute.name,
      name: enquiry.name.trim(),
      phone: enquiry.phone.trim(),
      email: enquiry.email.trim(),
      courseInterest: enquiry.courseInterest.trim(),
      message: enquiry.message.trim(),
    });

    pushToast({ tone: "success", title: "Enquiry sent", description: "Your enquiry has been saved successfully." });
    setShowEnquiry(false);
    setEnquiry({ name: "", phone: "", email: "", courseInterest: "", message: "" });
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="sticky top-0 z-30 mt-2 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--ivory)]/95 px-4 py-3 text-sm text-[var(--muted)] backdrop-blur">
        <div>
          <Link href="/coaching" className="font-medium text-[#1E40AF]">Coaching</Link> / {institute.name}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-xs">Share</button>
          <button type="button" onClick={() => setShowEnquiry(true)} className="btn-primary px-4 py-2 text-xs">Enquire Now</button>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-gradient-to-br from-[#1E40AF] to-[#1E3A8A] p-6 text-white shadow-[0_14px_48px_rgba(30,64,175,0.24)] lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white font-display text-3xl text-[#1E40AF]">{initials(institute.name)}</div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-blue-200">Coaching Institute · {institute.locality}, Mathura</p>
              <h1 className="mt-2 font-display text-4xl leading-tight">{institute.name}</h1>
              <p className="mt-1 text-sm text-blue-100">{displayHandle}</p>
              <p className="mt-2 max-w-2xl text-sm text-blue-100">{institute.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {institute.highlights.map((item) => (
                  <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">{item}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{institute.students || "-"}</div><div className="text-xs text-blue-100">Students</div></div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{institute.iitSelections + institute.neetSelections}</div><div className="text-xs text-blue-100">Selections</div></div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{institute.facultyCount}</div><div className="text-xs text-blue-100">Faculty</div></div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">About</p>
            <p className="mt-3 text-[15px] leading-8 text-[var(--navy)]">{institute.about}</p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Courses Offered</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {institute.courses.map((course) => (
                <article key={course.id} className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4">
                  <div className="mb-2 text-lg">🎯</div>
                  <h3 className="font-display text-xl text-[var(--navy)]">{course.name}</h3>
                  <p className="text-xs text-[var(--muted)]">{course.examType}</p>
                  <div className="mt-3 space-y-1 text-xs text-[var(--muted)]">
                    <p>Duration: <span className="font-semibold text-[var(--navy)]">{course.duration}</span></p>
                    <p>Batch size: <span className="font-semibold text-[var(--navy)]">{course.batchSize}</span></p>
                    <p>Schedule: <span className="font-semibold text-[var(--navy)]">{course.schedule}</span></p>
                  </div>
                  <p className="mt-3 font-display text-xl text-[#1E40AF]">{formatCurrency(course.feePerYear)} / year</p>
                  <button type="button" onClick={() => setShowEnquiry(true)} className="btn-secondary mt-3 w-full px-4 py-2 text-xs">Enquire for this course</button>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Results & Achievements</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-center"><p className="font-display text-3xl text-[#1E40AF]">{institute.iitSelections}</p><p className="text-xs text-[var(--muted)]">IIT Selections</p></div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-center"><p className="font-display text-3xl text-[#1E40AF]">{institute.neetSelections}</p><p className="text-xs text-[var(--muted)]">NEET Selections</p></div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-center"><p className="font-display text-3xl text-[#1E40AF]">{institute.passRate}%</p><p className="text-xs text-[var(--muted)]">Pass Rate</p></div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-center"><p className="font-display text-3xl text-[#1E40AF]">{institute.bestRank}</p><p className="text-xs text-[var(--muted)]">Best Rank</p></div>
            </div>
          </section>

          {institute.faculty.length > 0 ? (
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Faculty</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {institute.faculty.map((member) => (
                  <article key={member.id} className="rounded-xl border border-[var(--border)] p-4">
                    <h3 className="font-semibold text-[var(--navy)]">{member.name}</h3>
                    <p className="text-sm text-[var(--muted)]">{member.subject}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{member.experienceYears} years experience</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

        </div>

        <aside className="sticky top-20 h-fit space-y-4" id="enquire">
          <section className="rounded-2xl bg-[#1E40AF] p-5 text-white">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-blue-200">Fee Starting From</p>
            <p className="mt-2 font-display text-4xl">{formatCurrency(institute.feeRangeMin)}</p>
            <p className="text-sm text-blue-100">Per year · varies by course</p>
            <button
              type="button"
              onClick={() => {
                trackCoachingMetric(institute.id, "whatsappClicks");
                setShowEnquiry(true);
              }}
              className="btn-secondary mt-4 w-full border-white/40 bg-white text-sm text-[#1E40AF] hover:bg-blue-50"
            >
              Send Enquiry
            </button>
            <button
              type="button"
              onClick={() => trackCoachingMetric(institute.id, "saves")}
              className="btn-secondary mt-2 w-full border-white/40 bg-transparent text-sm text-white hover:bg-white/10"
            >
              Save Profile
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-[var(--muted)]">Location</p><p className="font-medium text-[var(--navy)]">{institute.locality}, Mathura</p></div>
              <div><p className="text-xs text-[var(--muted)]">Contact</p><p className="font-medium text-[var(--navy)]">{institute.phone}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Timings</p><p className="font-medium text-[var(--navy)]">{institute.timings}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Batch Size</p><p className="font-medium text-[var(--navy)]">{institute.batchSizeMin}-{institute.batchSizeMax} students</p></div>
              <div><p className="text-xs text-[var(--muted)]">Faculty</p><p className="font-medium text-[var(--navy)]">{institute.facultyCount} members</p></div>
              <div><p className="text-xs text-[var(--muted)]">Website</p><p className="font-medium text-[var(--navy)]">{institute.website || "N/A"}</p></div>
            </div>
          </section>
        </aside>
      </div>

      {showEnquiry ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(15,24,41,0.6)] p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-[var(--navy)]">Send Enquiry</h2>
              <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => setShowEnquiry(false)}>Close</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Your name" value={enquiry.name} onChange={(event) => setEnquiry((current) => ({ ...current, name: event.target.value }))} />
              <input className="field" placeholder="Phone" value={enquiry.phone} onChange={(event) => setEnquiry((current) => ({ ...current, phone: event.target.value }))} />
              <input className="field sm:col-span-2" placeholder="Email" value={enquiry.email} onChange={(event) => setEnquiry((current) => ({ ...current, email: event.target.value }))} />
              <select className="select sm:col-span-2" value={enquiry.courseInterest} onChange={(event) => setEnquiry((current) => ({ ...current, courseInterest: event.target.value }))}>
                <option value="">Select course interest</option>
                {institute.courses.map((course) => <option key={course.id} value={course.name}>{course.name}</option>)}
              </select>
              <textarea className="textarea sm:col-span-2" placeholder="Message" value={enquiry.message} onChange={(event) => setEnquiry((current) => ({ ...current, message: event.target.value }))} />
            </div>

            <button type="button" onClick={submitEnquiry} className="btn-primary mt-4 w-full px-5 py-3 text-sm">Submit Enquiry</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
