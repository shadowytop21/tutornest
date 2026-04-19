"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { loadAppState } from "@/lib/mock-db";
import { getTeacherAnalyticsSummary } from "@/lib/teacher-analytics";

function makeWeeklyBars(total: number) {
  const base = [0.11, 0.12, 0.13, 0.12, 0.16, 0.2, 0.16];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = base.map((ratio) => Math.max(0, Math.round(total * ratio)));
  const peak = Math.max(...values, 1);

  return labels.map((label, index) => ({
    label,
    value: values[index],
    height: 26 + Math.round((values[index] / peak) * 64),
    highlight: index >= 4,
  }));
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [analyticsTick, setAnalyticsTick] = useState(0);
  const [isAccepting, setIsAccepting] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const snapshot = loadAppState();
  const session = snapshot.session;
  const teacher = session ? snapshot.teachers.find((item) => item.user_id === session.id || item.name === session.name) : null;
  const teacherId = teacher?.id ?? "";

  const analytics = useMemo(
    () => (teacherId ? getTeacherAnalyticsSummary(teacherId) : { viewsLast7Days: 0, contactsLast7Days: 0, contactsThisMonth: 0, savedCount: 0, lastViewedAt: null, lastContactedAt: null, lastSavedAt: null }),
    [teacherId, analyticsTick],
  );
  const monthlyLimit = 15;
  const monthlyContactsUsed = analytics.contactsThisMonth;
  const monthlyContactsRemaining = Math.max(0, monthlyLimit - monthlyContactsUsed);

  useEffect(() => {
    const freshSnapshot = loadAppState();
    if (!freshSnapshot.session) {
      router.replace("/auth");
      return;
    }

    if (freshSnapshot.session.role !== "teacher") {
      router.replace("/browse");
      return;
    }

    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (!teacherId) {
      return;
    }

    const refreshAnalytics = () => {
      setAnalyticsTick((value) => value + 1);
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };

    refreshAnalytics();
    window.addEventListener("docent-teacher-analytics-change", refreshAnalytics);
    window.addEventListener("storage", refreshAnalytics);
    const intervalId = window.setInterval(refreshAnalytics, 15000);

    return () => {
      window.removeEventListener("docent-teacher-analytics-change", refreshAnalytics);
      window.removeEventListener("storage", refreshAnalytics);
      window.clearInterval(intervalId);
    };
  }, [teacherId]);

  if (!mounted) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading dashboard...</div>;
  }

  if (!teacher || !session) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--foreground)]">No teacher profile yet</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Create your teaching profile to start appearing in search results.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/teacher/setup" className="btn-primary px-6 py-3 text-sm">Create profile</Link>
            <Link href="/browse" className="btn-secondary px-6 py-3 text-sm">Browse Teachers</Link>
          </div>
        </div>
      </div>
    );
  }

  const profileCompletionItems = [
    { label: "Profile photo uploaded", done: Boolean(teacher.photo_url), pct: "+20%" },
    { label: "Bio written", done: Boolean(teacher.bio.trim()), pct: "+10%" },
    { label: "Subjects & grades filled", done: teacher.subjects.length > 0 && teacher.grades.length > 0, pct: "+30%" },
    { label: "Location & price set", done: Boolean(teacher.locality.trim()) && teacher.price_per_month > 0, pct: "+20%" },
    { label: "WhatsApp number added", done: Boolean(teacher.whatsapp_number.trim()), pct: "+20%" },
  ];

  const completionPercent = Math.round((profileCompletionItems.filter((item) => item.done).length / profileCompletionItems.length) * 100);
  const weeklyBars = makeWeeklyBars(analytics.viewsLast7Days);

  function copyProfileLink() {
    if (!teacher) {
      return;
    }

    const profileUrl = `${window.location.origin}/teacher/${teacher.id}`;

    if (!navigator.clipboard) {
      pushToast({ tone: "error", title: "Clipboard access is not available" });
      return;
    }

    navigator.clipboard.writeText(profileUrl).then(() => {
      pushToast({ tone: "success", title: "Profile link copied" });
    });
  }

  return (
    <div className="page-section">
      <span className="page-label">Teacher Dashboard</span>
      <div className="dashboard-wrapper">
        <aside className="dash-sidebar">
          <div className="dsb-logo">
            <div className="dsb-logo-mark">D</div>
            <span className="dsb-logo-text">Docent</span>
          </div>

          <div className="dsb-user">
            <div className="dsb-user-avatar">{session.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="dsb-user-name">{session.name}</div>
              <div className="dsb-user-status"><div className="dsb-user-dot" /> Profile Live</div>
            </div>
          </div>

          <div className="dsb-nav">
            <div className="dsb-nav-section">Main</div>
            <Link href="/teacher/dashboard" className="dsb-nav-item active"><span className="dsb-nav-icon">DB</span> Dashboard</Link>
            <Link href={`/teacher/${teacher.id}`} className="dsb-nav-item"><span className="dsb-nav-icon">PR</span> My Profile</Link>
            <Link href="/teacher/setup?edit=1" className="dsb-nav-item"><span className="dsb-nav-icon">ED</span> Edit Profile</Link>

            <div className="dsb-nav-section">Insights</div>
            <a href="#analytics" className="dsb-nav-item"><span className="dsb-nav-icon">AN</span> Analytics</a>
          </div>

          <div className="dsb-bottom">
            <button type="button" className="dsb-bottom-btn" onClick={copyProfileLink}><span className="dsb-nav-icon">LK</span> Share profile</button>
            <button type="button" className="dsb-bottom-btn" onClick={() => router.push("/auth")}><span className="dsb-nav-icon">LO</span> Logout</button>
          </div>
        </aside>

        <div className="dash-main">
          <div className="dash-topbar">
            <div className="dash-topbar-title">Dashboard</div>
            <div className="dash-topbar-right">
              <button type="button" className="notif-btn">N<div className="notif-dot" /></button>
              <Link href={`/teacher/${teacher.id}`} className="preview-btn">Preview Profile</Link>
              <button type="button" className="availability-toggle" onClick={() => setIsAccepting((current) => !current)}>
                <div className="toggle-dot" />
                {isAccepting ? "Accepting Students" : "Temporarily Unavailable"}
              </button>
            </div>
          </div>

          <div className="dash-content">
            <div className="welcome-banner">
              <div className="wb-text">
                <div className="wb-greeting">Good evening, {session.name.split(" ")[0]} </div>
                <div className="wb-sub">Your profile has {analytics.viewsLast7Days} views this week and {analytics.contactsLast7Days} direct contacts.</div>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div className="wb-badge">Profile {teacher.status === "verified" ? "Verified & Live" : "Pending Review"}</div>
                <div className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs text-[var(--muted)]">
                  Live sync {lastSyncedAt ?? "just now"}
                </div>
              </div>
            </div>

            <div className="dash-stats-row">
              <div className="dstat-card">
                <div className="dstat-top"><div className="dstat-icon dsi-saffron">VW</div><span className="dstat-trend trend-up">up</span></div>
                <div className="dstat-num">{analytics.viewsLast7Days}</div>
                <div className="dstat-label">Profile views this week</div>
              </div>
              <div className="dstat-card">
                <div className="dstat-top"><div className="dstat-icon dsi-green">CT</div><span className="dstat-trend trend-up">up</span></div>
                <div className="dstat-num">{analytics.contactsLast7Days}</div>
                <div className="dstat-label">WhatsApp contacts</div>
              </div>
              <div className="dstat-card">
                <div className="dstat-top"><div className="dstat-icon dsi-blue">EN</div><span className="dstat-trend trend-neutral">live</span></div>
                <div className="dstat-num">{monthlyContactsUsed}</div>
                <div className="dstat-label">Enquiries used this month</div>
              </div>
              <div className="dstat-card">
                <div className="dstat-top"><div className="dstat-icon dsi-blue">SV</div><span className="dstat-trend trend-up">up</span></div>
                <div className="dstat-num">{analytics.savedCount}</div>
                <div className="dstat-label">Parents saved profile</div>
              </div>
            </div>

            <div className="dash-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="dcard">
                  <div className="dcard-title">
                    Profile Completion
                    <Link href="/teacher/setup?edit=1" className="dcard-link">Edit profile</Link>
                  </div>
                  <div className="completion-header">
                    <div className="completion-pct">{completionPercent}%</div>
                    <div className="completion-note">Complete remaining profile steps to improve visibility.</div>
                  </div>
                  <div className="completion-bar-bg">
                    <div className={`completion-bar-fill ${completionPercent >= 100 ? "completion-fill-green" : ""}`} style={{ width: `${completionPercent}%` }} />
                  </div>
                  <div className="completion-items">
                    {profileCompletionItems.map((item) => (
                      <div key={item.label} className="ci">
                        <div className={`ci-icon ${item.done ? "ci-done-icon" : "ci-todo-icon"}`}>{item.done ? "OK" : "TO"}</div>
                        <div className={`ci-text ${item.done ? "done" : "todo"}`}>{item.label}</div>
                        <div className="ci-pct">{item.pct}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dcard" id="analytics">
                  <div className="dcard-title">
                    Profile Views - This Week
                    <a href="#" className="dcard-link">See analytics</a>
                  </div>
                  <div className="chart-area">
                    {weeklyBars.map((bar) => (
                      <div key={bar.label} className="chart-bar-wrap">
                        <div className="chart-val">{bar.value}</div>
                        <div className={`chart-bar ${bar.highlight ? "highlight" : ""}`} style={{ height: `${bar.height}px` }} />
                        <div className="chart-bar-label">{bar.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dcard" id="activity">
                  <div className="dcard-title">Recent Activity</div>
                  <div className="activity-list">
                    <div className="activity-item"><div className="activity-icon ai-view">EN</div><div className="activity-text"><div className="activity-main">Monthly enquiry quota</div><div className="activity-sub">{monthlyContactsUsed} used, {monthlyContactsRemaining} remaining</div></div><div className="activity-time">Live</div></div>
                    <div className="activity-item"><div className="activity-icon ai-whatsapp">CT</div><div className="activity-text"><div className="activity-main">Parent contacted via WhatsApp</div><div className="activity-sub">Weekly contacts: {analytics.contactsLast7Days}</div></div><div className="activity-time">Recent</div></div>
                    <div className="activity-item"><div className="activity-icon ai-save">SV</div><div className="activity-text"><div className="activity-main">Parents saved your profile</div><div className="activity-sub">Saved count: {analytics.savedCount}</div></div><div className="activity-time">Live</div></div>
                    <div className="activity-item"><div className="activity-icon ai-view">VW</div><div className="activity-text"><div className="activity-main">Profile viewed this week</div><div className="activity-sub">Views: {analytics.viewsLast7Days}</div></div><div className="activity-time">7d</div></div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="verify-box">
                  <div className="vb-icon">VK</div>
                  <div>
                    <div className="vb-title">Get Verified</div>
                    <div className="vb-desc">Complete your profile so parents can review your details quickly.</div>
                  </div>
                  <div className="vb-perks">
                    <div className="vb-perk"><div className="vb-perk-dot" />Complete all profile fields</div>
                    <div className="vb-perk"><div className="vb-perk-dot" />Keep availability current</div>
                    <div className="vb-perk"><div className="vb-perk-dot" />Share your profile link</div>
                    <div className="vb-perk"><div className="vb-perk-dot" />Track live enquiries</div>
                  </div>
                  <Link href="/teacher/setup?edit=1" className="btn-verify">Upload and Request Verification</Link>
                </div>

                <div className="dcard">
                  <div className="dcard-title">Share Your Profile</div>
                  <div style={{ background: "var(--ivory2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--muted)", marginBottom: "12px", wordBreak: "break-all", lineHeight: 1.6 }}>
                    {typeof window !== "undefined" ? `${window.location.origin}/teacher/${teacher.id}` : `/teacher/${teacher.id}`}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="button" onClick={copyProfileLink} style={{ flex: 1, padding: "9px", background: "var(--navy)", color: "white", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>Copy Link</button>
                    <Link href={`/teacher/${teacher.id}`} style={{ flex: 1, padding: "9px", background: "#25D366", color: "white", border: "none", borderRadius: "10px", fontSize: "12px", fontWeight: 500, textDecoration: "none", textAlign: "center", fontFamily: "var(--font-body)" }}>Open Profile</Link>
                  </div>
                </div>

                <div className="dcard" style={{ padding: 0, overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--border)" }}>
                    <div className="dcard-title" style={{ marginBottom: 0 }}>How Parents See You</div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "var(--saffron-mid)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 700, color: "var(--navy)", border: "2px solid white", boxShadow: "0 0 0 2px var(--border)" }}>{teacher.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", fontWeight: 500, color: "var(--navy)" }}>{teacher.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--muted)" }}>{teacher.locality} · {teacher.experience_years} yrs</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                      <span className="badge badge-verified" style={{ fontSize: "10px", padding: "3px 8px" }}>Live profile</span>
                    </div>
                    <div style={{ display: "flex", gap: "5px", marginBottom: "10px", flexWrap: "wrap" }}>
                      {teacher.subjects.slice(0, 2).map((subject) => <span key={subject} className="subj-pill" style={{ fontSize: "11px", padding: "4px 10px" }}>{subject}</span>)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 400, color: "var(--navy)" }}>{teacher.price_per_month} <span style={{ fontSize: "11px", fontWeight: 300, color: "var(--muted)" }}>/mo</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "var(--muted)" }}>Contacts {teacher.contactsThisMonth ?? 0}</div>
                    </div>
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
