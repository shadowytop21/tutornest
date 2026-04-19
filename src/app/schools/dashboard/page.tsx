"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getSchoolMetrics,
  listCustomSchools,
  listSchoolEnquiries,
  updateSchoolAdmissionSettings,
} from "@/lib/verticals-store";
import { seedSchools, type SchoolRecord } from "@/lib/verticals-data";

function completionItems(school: SchoolRecord) {
  return [
    { label: "About section", done: school.about.trim().length >= 50 },
    { label: "Fees matrix", done: school.classFees.length > 0 },
    { label: "Facilities selected", done: school.facilities.length > 0 },
    { label: "Affiliation number", done: Boolean(school.affiliationNumber) },
    { label: "Verification documents", done: Boolean(school.verificationDocumentName) },
  ];
}

export default function SchoolsDashboardPage() {
  const [customSchools, setCustomSchools] = useState<SchoolRecord[]>([]);
  const [activeSchoolId, setActiveSchoolId] = useState("");
  const [metrics, setMetrics] = useState({ profileViews: 0, saves: 0 });
  const [enquiries, setEnquiries] = useState<ReturnType<typeof listSchoolEnquiries>>([]);

  useEffect(() => {
    const load = () => {
      const custom = listCustomSchools();
      setCustomSchools(custom);
      setActiveSchoolId((current) => current || custom[0]?.id || seedSchools[0].id);
    };

    load();
    window.addEventListener("docent-schools-change", load);
    return () => window.removeEventListener("docent-schools-change", load);
  }, []);

  const allSchools = useMemo(() => [...customSchools, ...seedSchools], [customSchools]);
  const school = useMemo(
    () => allSchools.find((item) => item.id === activeSchoolId) ?? allSchools[0] ?? null,
    [activeSchoolId, allSchools],
  );

  useEffect(() => {
    if (!school) {
      return;
    }

    const refresh = () => {
      setMetrics(getSchoolMetrics(school.id));
      setEnquiries(listSchoolEnquiries(school.id));
    };

    refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("docent-schools-change", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("docent-schools-change", refresh);
    };
  }, [school]);

  if (!school) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--foreground)]">No school profile found</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Register your school to unlock admission analytics.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/schools/register" className="btn-primary px-6 py-3 text-sm">Register school</Link>
            <Link href="/schools" className="btn-secondary px-6 py-3 text-sm">Browse schools</Link>
          </div>
        </div>
      </div>
    );
  }

  const items = completionItems(school);
  const completion = Math.round((items.filter((item) => item.done).length / items.length) * 100);

  return (
    <div className="page-section">
      <span className="page-label">Schools Dashboard</span>
      <div className="dashboard-wrapper">
        <aside className="dash-sidebar">
          <div className="dsb-logo">
            <div className="dsb-logo-mark">D</div>
            <span className="dsb-logo-text">Docent</span>
          </div>

          <div className="dsb-user">
            <div className="dsb-user-avatar">SC</div>
            <div>
              <div className="dsb-user-name">{school.name}</div>
              <div className="dsb-user-status"><div className="dsb-user-dot" /> {school.admissionOpen ? "Admissions Open" : "Admissions Closed"}</div>
            </div>
          </div>

          <div className="dsb-nav">
            <div className="dsb-nav-section">Main</div>
            <a href="#" className="dsb-nav-item active"><span className="dsb-nav-icon">DB</span> Dashboard</a>
            <Link href={`/schools/${school.id}`} className="dsb-nav-item"><span className="dsb-nav-icon">PR</span> Public Profile</Link>
            <Link href="/schools/register" className="dsb-nav-item"><span className="dsb-nav-icon">ED</span> Edit Submission</Link>
          </div>
        </aside>

        <div className="dash-main">
          <div className="dash-topbar">
            <div className="dash-topbar-title">Schools Dashboard</div>
            <div className="dash-topbar-right">
              <select className="select !w-auto" value={school.id} onChange={(event) => setActiveSchoolId(event.target.value)}>
                {allSchools.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              <Link href={`/schools/${school.id}`} className="preview-btn">Preview Profile</Link>
            </div>
          </div>

          <div className="dash-content">
            <div className="welcome-banner">
              <div className="wb-text">
                <div className="wb-greeting">Admission Performance</div>
                <div className="wb-sub">Manage admission status and monitor engagement from one dashboard.</div>
              </div>
              <div className="wb-badge">{school.status.toUpperCase()}</div>
            </div>

            <div className="dash-stats-row">
              <div className="dstat-card"><div className="dstat-num">{enquiries.length}</div><div className="dstat-label">Admission enquiries</div></div>
              <div className="dstat-card"><div className="dstat-num">{metrics.profileViews}</div><div className="dstat-label">Profile views</div></div>
              <div className="dstat-card"><div className="dstat-num">{metrics.saves}</div><div className="dstat-label">Saves</div></div>
            </div>

            <div className="dash-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="dcard">
                  <div className="dcard-title">Profile Completion</div>
                  <div className="completion-header">
                    <div className="completion-pct">{completion}%</div>
                    <div className="completion-note">Complete all sections for stronger parent trust.</div>
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

                <div className="dcard">
                  <div className="dcard-title">Recent Admission Activity</div>
                  <div className="activity-list">
                    {enquiries.slice(0, 6).map((item) => (
                      <div key={item.id} className="activity-item">
                        <div className="activity-icon ai-whatsapp">AD</div>
                        <div className="activity-text">
                          <div className="activity-main">Application enquiry from {item.name}</div>
                          <div className="activity-sub">{item.phone}</div>
                        </div>
                      </div>
                    ))}
                    {enquiries.length === 0 ? <div className="activity-item"><div className="activity-text"><div className="activity-main">No admission enquiries yet</div></div></div> : null}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="verify-box">
                  <div className="vb-icon">AD</div>
                  <div>
                    <div className="vb-title">Admission Controls</div>
                    <div className="vb-desc">Toggle admission state and keep deadline updated for families.</div>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="btn-verify"
                      onClick={() => updateSchoolAdmissionSettings(school.id, { admissionOpen: !school.admissionOpen, admissionDeadline: school.admissionDeadline })}
                    >
                      {school.admissionOpen ? "Set Admissions Closed" : "Set Admissions Open"}
                    </button>

                    <input
                      type="date"
                      className="field"
                      value={school.admissionDeadline || ""}
                      onChange={(event) => updateSchoolAdmissionSettings(school.id, { admissionOpen: school.admissionOpen, admissionDeadline: event.target.value })}
                    />
                  </div>
                </div>

                <div className="dcard">
                  <div className="dcard-title">Quick Actions</div>
                  <div className="space-y-2">
                    <Link href="/schools/register" className="btn-secondary w-full px-4 py-2 text-sm">Update Profile</Link>
                    <Link href="/schools" className="btn-secondary w-full px-4 py-2 text-sm">Open Browse Listing</Link>
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
