"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { seedSchools, type SchoolRecord } from "@/lib/verticals-data";
import { createSchoolEnquiry, listCustomSchools, trackSchoolMetric } from "@/lib/verticals-store";
import { useToast } from "@/components/toast-provider";

const sampleParentReviews = [
  {
    parent: "Sunita Kumar",
    childClass: "Class 9",
    rating: 5,
    text: "Strong academics, disciplined environment, and very responsive teachers. My child has improved significantly in core subjects.",
  },
  {
    parent: "Rakesh Sharma",
    childClass: "Class 11",
    rating: 5,
    text: "Excellent science faculty and better infrastructure in the last few years. Smart classrooms and labs are very useful.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function stars(rating: number) {
  const filled = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return `${filled}${empty}`;
}

export default function SchoolProfilePage() {
  const params = useParams<{ id: string }>();
  const { pushToast } = useToast();
  const [customSchools, setCustomSchools] = useState<SchoolRecord[]>([]);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: "", phone: "", email: "", message: "" });

  useEffect(() => {
    const load = () => setCustomSchools(listCustomSchools());
    load();
    window.addEventListener("docent-schools-change", load);
    return () => window.removeEventListener("docent-schools-change", load);
  }, []);

  const school = useMemo(() => {
    const merged = [...customSchools, ...seedSchools];
    return merged.find((item) => item.id === params.id) ?? null;
  }, [customSchools, params.id]);

  useEffect(() => {
    if (!school) {
      return;
    }

    trackSchoolMetric(school.id, "profileViews");
  }, [school]);

  if (!school) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-[var(--navy)]">School not found</h1>
        <p className="mt-3 text-[var(--muted)]">This school might be unavailable or still under review.</p>
        <Link href="/schools" className="btn-primary mt-8 px-6 py-3 text-sm">Back to School Browse</Link>
      </div>
    );
  }

  function submitAdmissionEnquiry() {
    if (!school) {
      return;
    }

    if (!enquiry.name.trim() || !enquiry.phone.trim() || !enquiry.email.trim()) {
      pushToast({ tone: "error", title: "Please fill required admission enquiry fields" });
      return;
    }

    createSchoolEnquiry({
      schoolId: school.id,
      schoolName: school.name,
      name: enquiry.name.trim(),
      phone: enquiry.phone.trim(),
      email: enquiry.email.trim(),
      message: enquiry.message.trim(),
    });

    pushToast({ tone: "success", title: "Admission enquiry submitted" });
    setEnquiry({ name: "", phone: "", email: "", message: "" });
    setShowEnquiry(false);
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="sticky top-0 z-30 mt-2 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--ivory)]/95 px-4 py-3 text-sm text-[var(--muted)] backdrop-blur">
        <div>
          <Link href="/schools" className="font-medium text-[#0D7377]">Schools</Link> / {school.name}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="btn-secondary px-4 py-2 text-xs">Share</button>
          <button type="button" onClick={() => setShowEnquiry(true)} className="btn-primary px-4 py-2 text-xs">Apply for Admission</button>
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--border)] bg-gradient-to-br from-[#0D7377] to-[#065F46] p-6 text-white shadow-[0_14px_48px_rgba(13,115,119,0.24)] lg:p-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white font-display text-3xl text-[#0D7377]">{initials(school.name)}</div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal-200">{school.boards.join(" / ")} School · {school.locality}, Mathura · Est. {school.establishedYear}</p>
              <h1 className="mt-2 font-display text-4xl leading-tight">{school.name}</h1>
              <p className="mt-2 max-w-2xl text-sm text-teal-100">{school.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">{school.boards.join(" / ")} Affiliated</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">{school.schoolType}</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">{school.admissionOpen ? "Admissions Open" : "Admissions Closed"}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{school.rating.toFixed(1)}★</div><div className="text-xs text-teal-100">Rating</div></div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{school.reviewsCount}</div><div className="text-xs text-teal-100">Reviews</div></div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{school.studentCount || school.students || "-"}</div><div className="text-xs text-teal-100">Students</div></div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"><div className="font-display text-2xl">{school.teacherCount || school.teachers || "-"}</div><div className="text-xs text-teal-100">Teachers</div></div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-5">
            <div className="bg-white p-4 text-center"><p className="font-display text-xl text-[var(--navy)]">{school.classesRange}</p><p className="text-xs text-[var(--muted)]">Classes</p></div>
            <div className="bg-white p-4 text-center"><p className="font-display text-xl text-[var(--navy)]">{school.boards.join(" / ")}</p><p className="text-xs text-[var(--muted)]">Board</p></div>
            <div className="bg-white p-4 text-center"><p className="font-display text-xl text-[var(--navy)]">{school.studentCount || school.students || "-"}</p><p className="text-xs text-[var(--muted)]">Students</p></div>
            <div className="bg-white p-4 text-center"><p className="font-display text-xl text-[var(--navy)]">{school.teacherCount || school.teachers || "-"}</p><p className="text-xs text-[var(--muted)]">Teachers</p></div>
            <div className="bg-white p-4 text-center"><p className="font-display text-xl text-[var(--navy)]">{school.establishedYear}</p><p className="text-xs text-[var(--muted)]">Established</p></div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">About the School</p>
            <p className="mt-3 text-[15px] leading-8 text-[var(--navy)]">{school.about}</p>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Classes & Annual Fees</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {school.classFees.map((item) => (
                <article key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4 text-center">
                  <h3 className="font-display text-xl text-[var(--navy)]">{item.label}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#0D7377]">{formatCurrency(item.annualFee)} / year</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Facilities</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {school.facilities.map((facility) => (
                <div key={facility} className="rounded-xl border border-[var(--border)] bg-teal-50 p-3 text-sm font-medium text-[#0D7377]">{facility}</div>
              ))}
            </div>
          </section>

          {school.gallery.length > 0 ? (
            <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Photo Gallery</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {school.gallery.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex h-28 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--ivory)] text-2xl">
                    {item}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[var(--border)] bg-white p-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Parent Reviews ({school.reviewsCount || sampleParentReviews.length})</p>
            <div className="mt-4 space-y-3">
              {sampleParentReviews.map((review) => (
                <article key={review.parent} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--navy)]">{review.parent}</h4>
                      <p className="text-xs text-[var(--muted)]">Parent of {review.childClass}</p>
                    </div>
                    <span className="text-sm text-[var(--saffron)]">{stars(review.rating)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{review.text}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="sticky top-20 h-fit space-y-4">
          <section className="rounded-2xl bg-[#0D7377] p-5 text-white">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-teal-200">Admissions</p>
            <p className="mt-2 font-display text-3xl">{school.admissionOpen ? "Open" : "Closed"} for current session</p>
            <p className="text-sm text-teal-100">Starting annual fee: {formatCurrency(school.annualFeeMin)}</p>

            <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <span className={`inline-block h-2 w-2 rounded-full ${school.admissionOpen ? "bg-amber-300 animate-pulse" : "bg-white/50"}`} />
              <span className="text-teal-100">Deadline</span>
              <span className="ml-auto text-white">{school.admissionDeadline || "N/A"}</span>
            </div>

            <button type="button" onClick={() => setShowEnquiry(true)} className="btn-secondary mt-4 w-full border-white/40 bg-white text-sm text-[#0D7377] hover:bg-teal-50">Apply for Admission</button>
            <button type="button" onClick={() => trackSchoolMetric(school.id, "saves")} className="btn-secondary mt-2 w-full border-white/40 bg-transparent text-sm text-white hover:bg-white/10">Save School</button>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-[var(--muted)]">Location</p><p className="font-medium text-[var(--navy)]">{school.locality}, Mathura</p></div>
              <div><p className="text-xs text-[var(--muted)]">Address</p><p className="font-medium text-[var(--navy)]">{school.fullAddress}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Contact</p><p className="font-medium text-[var(--navy)]">{school.contactPhone || "Login to view"}</p></div>
              <div><p className="text-xs text-[var(--muted)]">School Hours</p><p className="font-medium text-[var(--navy)]">{school.schoolHours || "N/A"}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Affiliation No.</p><p className="font-medium text-[var(--navy)]">{school.affiliationNumber}</p></div>
              <div><p className="text-xs text-[var(--muted)]">Transport</p><p className="font-medium text-[var(--navy)]">{school.transportAvailable ? `Available (${formatCurrency(school.transportFee)}/yr)` : "Not available"}</p></div>
            </div>
          </section>
        </aside>
      </div>

      {showEnquiry ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(15,24,41,0.6)] p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl text-[var(--navy)]">Admission Enquiry</h2>
              <button type="button" className="btn-ghost px-3 py-1 text-xs" onClick={() => setShowEnquiry(false)}>Close</button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="Parent name" value={enquiry.name} onChange={(event) => setEnquiry((current) => ({ ...current, name: event.target.value }))} />
              <input className="field" placeholder="Phone" value={enquiry.phone} onChange={(event) => setEnquiry((current) => ({ ...current, phone: event.target.value }))} />
              <input className="field sm:col-span-2" placeholder="Email" value={enquiry.email} onChange={(event) => setEnquiry((current) => ({ ...current, email: event.target.value }))} />
              <textarea className="textarea sm:col-span-2" placeholder="Message" value={enquiry.message} onChange={(event) => setEnquiry((current) => ({ ...current, message: event.target.value }))} />
            </div>

            <button type="button" onClick={submitAdmissionEnquiry} className="btn-primary mt-4 w-full px-5 py-3 text-sm">Submit Enquiry</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
