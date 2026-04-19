"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCoachingMetrics,
  listCoachingEnquiries,
  listCustomCoachingInstitutes,
  setCoachingInstituteStatus,
} from "@/lib/verticals-store";
import { seedCoachingInstitutes, type CoachingInstitute } from "@/lib/verticals-data";

function completionItems(institute: CoachingInstitute) {
  return [
    { label: "Logo uploaded", done: Boolean(institute.logoUrl) },
    { label: "About section", done: institute.about.trim().length >= 50 },
    { label: "Courses listed", done: institute.courses.length > 0 },
    { label: "Fee range added", done: institute.feeRangeMin > 0 && institute.feeRangeMax > 0 },
    { label: "Verification document", done: Boolean(institute.verificationDocumentName) },
  ];
}

export default function CoachingDashboardPage() {
  const [customInstitutes, setCustomInstitutes] = useState<CoachingInstitute[]>([]);
  const [activeInstituteId, setActiveInstituteId] = useState("");

  useEffect(() => {
    const load = () => {
      const custom = listCustomCoachingInstitutes();
      setCustomInstitutes(custom);
      setActiveInstituteId((current) => current || custom[0]?.id || seedCoachingInstitutes[0].id);
    };

    load();
    window.addEventListener("docent-coaching-change", load);
    return () => window.removeEventListener("docent-coaching-change", load);
  }, []);

  const allInstitutes = useMemo(() => [...customInstitutes, ...seedCoachingInstitutes], [customInstitutes]);
  const institute = useMemo(
    () => allInstitutes.find((item) => item.id === activeInstituteId) ?? allInstitutes[0] ?? null,
    [activeInstituteId, allInstitutes],
  );

  if (!institute) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--foreground)]">No institute profile found</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Create your coaching profile to unlock dashboard insights.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/coaching/register" className="btn-primary px-6 py-3 text-sm">Register institute</Link>
            <Link href="/coaching" className="btn-secondary px-6 py-3 text-sm">Browse coaching</Link>
          </div>
        </div>
      </div>
    );
  }

  const metrics = getCoachingMetrics(institute.id);
  const enquiries = listCoachingEnquiries(institute.id);
  const items = completionItems(institute);
  const completion = Math.round((items.filter((item) => item.done).length / items.length) * 100);

  return (
    <div className="page-section">
      <span className="page-label">Coaching Dashboard</span>
      <div className="dashboard-wrapper">
        <aside className="dash-sidebar">
          <div className="dsb-logo">
            <div className="dsb-logo-mark">D</div>
            <span className="dsb-logo-text">Docent</span>
          </div>

          <div className="dsb-user">
            <div className="dsb-user-avatar">CI</div>
            <div>
              <div className="dsb-user-name">{institute.name}</div>
              <div className="dsb-user-status"><div className="dsb-user-dot" /> {institute.status === "verified" ? "Verified" : "Under Review"}</div>
            </div>
          </div>

          <div className="dsb-nav">
            <div className="dsb-nav-section">Main</div>
            <a href="#" className="dsb-nav-item active"><span className="dsb-nav-icon">DB</span> Dashboard</a>
            <Link href={`/coaching/${institute.id}`} className="dsb-nav-item"><span className="dsb-nav-icon">PR</span> Public Profile</Link>
            <Link href="/coaching/register" className="dsb-nav-item"><span className="dsb-nav-icon">ED</span> Edit Submission</Link>

            <div className="dsb-nav-section">Activity</div>
            <a href="#activity" className="dsb-nav-item"><span className="dsb-nav-icon">AC</span> Activity Feed</a>
          </div>
        </aside>

        <div className="dash-main">
          <div className="dash-topbar">
            <div className="dash-topbar-title">Coaching Dashboard</div>
            <div className="dash-topbar-right">
              <select className="select !w-auto" value={institute.id} onChange={(event) => setActiveInstituteId(event.target.value)}>
                {allInstitutes.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <Link href={`/coaching/${institute.id}`} className="preview-btn">Preview Profile</Link>
            </div>
          </div>

          <div className="dash-content">
            <div className="welcome-banner">
              <div className="wb-text">
                <div className="wb-greeting">Performance Overview</div>
                <div className="wb-sub">Track enquiries and engagement for your coaching profile in one place.</div>
              </div>
              <div className="wb-badge">{institute.status.toUpperCase()}</div>
            </div>

            <div className="dash-stats-row">
              <div className="dstat-card"><div className="dstat-num">{enquiries.length}</div><div className="dstat-label">Enquiries received</div></div>
              <div className="dstat-card"><div className="dstat-num">{metrics.profileViews}</div><div className="dstat-label">Profile views</div></div>
              <div className="dstat-card"><div className="dstat-num">{metrics.whatsappClicks}</div><div className="dstat-label">WhatsApp clicks</div></div>
              <div className="dstat-card"><div className="dstat-num">{metrics.saves}</div><div className="dstat-label">Saved count</div></div>
            </div>

            <div className="dash-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="dcard">
                  <div className="dcard-title">Profile Completion</div>
                  <div className="completion-header">
                    <div className="completion-pct">{completion}%</div>
                    <div className="completion-note">Complete all sections for better search ranking.</div>
                  </div>
                  <div className="completion-bar-bg"><div className="completion-bar-fill" style={{ width: `${completion}%` }} /></div>
                  <div className="completion-items">
                    {items.map((item) => (
                      <div key={item.label} className="ci">
                        <div className={`ci-icon ${item.done ? "ci-done-icon" : "ci-todo-icon"}`}>{item.done ? "OK" : "TO"}</div>
                        <div className={`ci-text ${item.done ? "done" : "todo"}`}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dcard" id="activity">
                  <div className="dcard-title">Activity Feed</div>
                  <div className="activity-list">
                    {enquiries.slice(0, 6).map((item) => (
                      <div key={item.id} className="activity-item">
                        <div className="activity-icon ai-whatsapp">EN</div>
                        <div className="activity-text">
                          <div className="activity-main">New enquiry from {item.name}</div>
                          <div className="activity-sub">{item.courseInterest} · {item.phone}</div>
                        </div>
                      </div>
                    ))}
                    {enquiries.length === 0 ? <div className="activity-item"><div className="activity-text"><div className="activity-main">No enquiries yet</div></div></div> : null}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="verify-box">
                  <div className="vb-icon">VR</div>
                  <div>
                    <div className="vb-title">Verification Status</div>
                    <div className="vb-desc">Approved institutes appear first on browse and gain higher trust.</div>
                  </div>
                  <div className="vb-perks">
                    <div className="vb-perk"><div className="vb-perk-dot" />Higher placement in results</div>
                    <div className="vb-perk"><div className="vb-perk-dot" />Trust badge on profile</div>
                  </div>
                  <button type="button" className="btn-verify" onClick={() => setCoachingInstituteStatus(institute.id, "pending")}>Request Re-verification</button>
                </div>

                <div className="dcard">
                  <div className="dcard-title">Quick Actions</div>
                  <div className="space-y-2">
                    <Link href="/coaching/register" className="btn-secondary w-full px-4 py-2 text-sm">Update Profile</Link>
                    <Link href="/coaching" className="btn-secondary w-full px-4 py-2 text-sm">Open Browse Listing</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
