"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { formatHandle } from "@/lib/handles";
import { isTeacherVisiblePublicly, loadAppState, submitReview } from "@/lib/mock-db";
import { getTeacherFromCache, upsertTeachersToCache } from "@/lib/teacher-cache";
import {
  getTeacherAnalyticsSummary,
  canTeacherReceiveContact,
  isTeacherSaved,
  recordTeacherContact,
  recordTeacherProfileView,
  toggleTeacherSaved,
} from "@/lib/teacher-analytics";
import { formatCurrency, formatDate, whatsappLink } from "@/lib/utils";
import type { ReviewRecord, TeacherRecord } from "@/lib/data";

function SidebarGlyph({ kind }: { kind: "location" | "availability" | "response" | "contact" }) {
  if (kind === "location") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }

  if (kind === "availability") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (kind === "response") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
      <path d="M9 14h3" />
    </svg>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isGarbageText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return true;
  }

  if (/^[\d\s._-]+$/.test(trimmed)) {
    return true;
  }

  return !/[A-Za-z]/.test(trimmed);
}

function isNumericOnly(value: string) {
  return /^[0-9]+$/.test(value.trim());
}

function getTeacherName(teacher: TeacherRecord | null) {
  const value = teacher?.name?.trim() ?? "";
  if (isNumericOnly(value)) {
    return "Teacher Profile";
  }

  return isGarbageText(value) ? "Teacher Profile" : value;
}

function getTeacherBio(teacher: TeacherRecord | null) {
  const value = teacher?.bio?.trim() ?? "";

  if (!value || value.length < 15 || isNumericOnly(value) || isGarbageText(value)) {
    return "This teacher hasn't added a bio yet.";
  }

  return value;
}

function isFallbackBio(teacher: TeacherRecord | null) {
  const value = teacher?.bio?.trim() ?? "";
  return !value || value.length < 15 || isNumericOnly(value) || isGarbageText(value);
}

function formatExperience(years: number) {
  if (!Number.isFinite(years) || years <= 0 || years > 40) {
    return "—";
  }

  return `${Math.round(years)} years experience`;
}

function formatExperienceYears(years: number) {
  if (!Number.isFinite(years) || years <= 0 || years > 40) {
    return "—";
  }

  return Math.round(years).toString();
}

function formatStatValue(value: number | null | undefined, options?: { decimals?: number; suffix?: string }) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const decimals = options?.decimals ?? 0;
  const suffix = options?.suffix ?? "";
  const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  return `${formatted}${suffix}`;
}

function normalizePhotoUrl(url: string | null | undefined) {
  const raw = (url ?? "").trim();
  if (!raw || raw === "null" || raw === "undefined") {
    return "";
  }

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  return raw;
}

export default function TeacherProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { pushToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [parentName, setParentName] = useState("");
  const [showContactLoginModal, setShowContactLoginModal] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(false);
  const whatsappButtonRef = useRef<HTMLButtonElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [remoteTeachers, setRemoteTeachers] = useState<TeacherRecord[] | null>(null);
  const [remoteReviews, setRemoteReviews] = useState<ReviewRecord[] | null>(null);
  const [isRemoteLoading, setIsRemoteLoading] = useState(true);
  const [localSnapshot, setLocalSnapshot] = useState(() => loadAppState());
  const [cachedTeacher, setCachedTeacher] = useState<TeacherRecord | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [isSavedByParent, setIsSavedByParent] = useState(false);
  const viewedTeacherIdRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setCachedTeacher(getTeacherFromCache(params.id));
  }, [params.id]);

  const loadRemoteCatalog = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/teacher/${params.id}`, { signal });
      if (!response.ok) {
        setIsRemoteLoading(false);
        return;
      }

      const payload = (await response.json()) as { teacher?: TeacherRecord | null; reviews?: ReviewRecord[]; offline?: boolean };
      if (payload.offline) {
        setIsRemoteLoading(false);
        return;
      }

      if (payload.teacher) {
        upsertTeachersToCache([payload.teacher]);
        setCachedTeacher(payload.teacher);
      }

      setRemoteTeachers(payload.teacher ? [payload.teacher] : []);
      setRemoteReviews(payload.reviews ?? []);
      setIsRemoteLoading(false);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return;
      }

      setIsRemoteLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const waButton = whatsappButtonRef.current;
    if (!waButton || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      waButton.style.animationPlayState = entry.isIntersecting ? "running" : "paused";
    }, { threshold: 0.5 });

    observer.observe(waButton);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (mounted) {
      setLocalSnapshot(loadAppState());
    }
  }, [mounted, refreshKey]);

  const mergedTeachers = useMemo(() => {
    const byId = new Map<string, TeacherRecord>();

    for (const item of remoteTeachers ?? []) {
      byId.set(item.id, item);
    }

    if (cachedTeacher && !byId.has(cachedTeacher.id)) {
      byId.set(cachedTeacher.id, cachedTeacher);
    }

    for (const item of localSnapshot.teachers) {
      if (!byId.has(item.id)) {
        byId.set(item.id, item);
      }
    }

    return Array.from(byId.values());
  }, [cachedTeacher, localSnapshot.teachers, remoteTeachers]);

  const mergedReviews = useMemo(() => {
    const byId = new Map<string, ReviewRecord>();

    for (const item of remoteReviews ?? []) {
      byId.set(item.id, item);
    }

    for (const item of localSnapshot.reviews) {
      if (!byId.has(item.id)) {
        byId.set(item.id, item);
      }
    }

    return Array.from(byId.values());
  }, [localSnapshot.reviews, remoteReviews]);

  const snapshot = {
    teachers: mergedTeachers,
    reviews: mergedReviews,
    session: localSnapshot.session,
    profiles: localSnapshot.profiles,
  };

  const teacher = snapshot.teachers.find((item) => item.id === params.id) ?? null;
  const teacherReviews = snapshot.reviews.filter((item) => item.teacher_id === params.id);
  const session = snapshot.session;
  const hasLocalTeacher = Boolean(cachedTeacher) || localSnapshot.teachers.some((item) => item.id === params.id);
  const isRejected = teacher?.status === "rejected";
  const isParent = session?.role === "parent";
  const existingReview = isParent && teacher
    ? teacherReviews.find((review) => review.parent_id === session?.id) ?? null
    : null;

  useEffect(() => {
    const controller = new AbortController();
    if (hasLocalTeacher) {
      setIsRemoteLoading(false);
    }

    loadRemoteCatalog(controller.signal);
    return () => controller.abort();
  }, [hasLocalTeacher, loadRemoteCatalog]);

  useEffect(() => {
    if (!mounted || !teacher) {
      return;
    }

    if (viewedTeacherIdRef.current === teacher.id) {
      return;
    }

    viewedTeacherIdRef.current = teacher.id;
    recordTeacherProfileView(teacher.id);
  }, [mounted, teacher]);

  useEffect(() => {
    if (!isParent || !session?.id || !teacher) {
      setIsSavedByParent(false);
      return;
    }

    setIsSavedByParent(isTeacherSaved(teacher.id, session.id));
  }, [isParent, session?.id, teacher]);

  const profilePhotoUrl = useMemo(() => normalizePhotoUrl(teacher?.photo_url), [teacher?.photo_url]);

  useEffect(() => {
    setPhotoFailed(false);
  }, [teacher?.id, profilePhotoUrl]);

  if (!mounted || (!teacher && isRemoteLoading)) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading profile...</div>;
  }

  if (!teacher || isRejected) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold text-[var(--foreground)]">Teacher not found</h1>
        <p className="mt-4 text-lg text-[var(--muted)]">The tutor you are looking for may not exist or may not be public yet.</p>
        <button type="button" onClick={() => router.push("/browse")} className="btn-primary mt-8 px-6 py-3 text-sm">Back to browse</button>
      </div>
    );
  }

  const isPublicProfileVisible = isTeacherVisiblePublicly(teacher);
  const isTeacherOwner = Boolean(session?.id && teacher.user_id === session.id);
  const isTeacherSession = session?.role === "teacher" || isTeacherOwner;
  const analyticsSummary = getTeacherAnalyticsSummary(teacher.id);
  const similarTeachers = snapshot.teachers
    .filter((item) => item.id !== teacher.id && item.status === "verified")
    .slice(0, 6);
  const displayName = getTeacherName(teacher);
  const displayBio = getTeacherBio(teacher);
  const isMutedBio = isFallbackBio(teacher);
  const displayExperience = formatExperience(teacher.experience_years);
  const displayExperienceYears = formatExperienceYears(teacher.experience_years);
  const displayContacts = formatStatValue(analyticsSummary.contactsLast7Days);
  const displayHandle = formatHandle(teacher.handle ?? teacher.name);
  const initials = initialsFromName(displayName);
  const subjectPills = teacher.subjects.length ? teacher.subjects : ["Not specified"];
  const gradesLabel = teacher.grades.length ? teacher.grades.join(", ") : "—";
  const boardsLabel = teacher.boards.length ? teacher.boards.join(", ") : "—";
  const teachesAtLabel = teacher.teaches_at.replace("_", " ") || "—";
  const availabilityLabel = teacher.availability.length ? teacher.availability.join(", ") : "—";
  const localityLabel = teacher.locality?.trim() ? teacher.locality : "—";
  const priceLabel = teacher.price_per_month > 0 ? formatCurrency(teacher.price_per_month) : "—";

  async function handleReviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const teacherForAction = teacher;

    if (!teacherForAction) {
      return;
    }

    if (!session || !isParent) {
      router.push(`/auth?role=parent&next=/teacher/${teacherForAction.id}`);
      return;
    }

    const actualParentName = parentName || session.name || "Parent";

    try {
      submitReview({
        teacherId: teacherForAction.id,
        parentId: session.id,
        parentName: actualParentName,
        rating,
        comment,
        allowEdit: Boolean(existingReview),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit review";
      pushToast({ tone: "error", title: message });
      return;
    }

    await loadRemoteCatalog();
    setRefreshKey((value) => value + 1);
    setLocalSnapshot(loadAppState());
    pushToast({ tone: "success", title: existingReview ? "Review updated" : "Review posted" });
  }

  async function handleContactTeacher() {
    const teacherForAction = teacher;

    if (!teacherForAction) {
      return;
    }

    if (!session) {
      setShowContactLoginModal(true);
      return;
    }

    if (isTeacherSession) {
      pushToast({ tone: "neutral", title: "Teachers cannot contact their own profile." });
      return;
    }

    if (!isParent) {
      setShowContactLoginModal(true);
      return;
    }

    if (!teacherForAction.whatsapp_number) {
      pushToast({ tone: "error", title: "WhatsApp number is not available for this teacher." });
      return;
    }

    setIsContactLoading(true);
    try {
      const response = await fetch("/api/teacher/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: teacherForAction.id, parentId: session.id }),
      });

      const payload = (await response.json().catch(() => null)) as { ok?: boolean; whatsappNumber?: string; message?: string } | null;

      if (!response.ok) {
        const rateLimited = response.status === 429 || (payload?.message ?? "").toLowerCase().includes("monthly");
        if (rateLimited || !canTeacherReceiveContact(teacherForAction.id)) {
          pushToast({ tone: "error", title: "This teacher has reached the 15 enquiries per month limit." });
          return;
        }

        recordTeacherContact(teacherForAction.id);
        window.open(
          whatsappLink(teacherForAction.whatsapp_number, "Hi, I found your profile on Docent and I'm interested in home tuition for my child."),
          "_blank",
          "noopener,noreferrer",
        );
        return;
      }

      if (!payload?.whatsappNumber) {
        throw new Error("WhatsApp number is not available");
      }

      recordTeacherContact(teacherForAction.id);
      window.open(
        whatsappLink(payload.whatsappNumber, "Hi, I found your profile on Docent and I'm interested in home tuition for my child."),
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      if (!canTeacherReceiveContact(teacherForAction.id)) {
        pushToast({ tone: "error", title: "This teacher has reached the 15 enquiries per month limit." });
      } else {
        recordTeacherContact(teacherForAction.id);
        window.open(
          whatsappLink(teacherForAction.whatsapp_number, "Hi, I found your profile on Docent and I'm interested in home tuition for my child."),
          "_blank",
          "noopener,noreferrer",
        );
      }
    }
    setIsContactLoading(false);
  }

  function handleSaveProfile() {
    const teacherForAction = teacher;

    if (!teacherForAction) {
      return;
    }

    if (!session) {
      router.push(`/auth?role=parent&next=/teacher/${teacherForAction.id}`);
      return;
    }

    if (!isParent || !session.id) {
      pushToast({ tone: "neutral", title: "Only parents can save tutor profiles." });
      return;
    }

    const nextSaved = toggleTeacherSaved(teacherForAction.id, session.id);
    setIsSavedByParent(nextSaved);
    pushToast({ tone: "success", title: nextSaved ? "Profile saved" : "Profile removed from saved list" });
  }

  function handleShareProfile() {
    const teacherForAction = teacher;

    if (!teacherForAction) {
      return;
    }

    const url = `${window.location.origin}/teacher/${teacherForAction.id}`;
    if (!navigator.clipboard) {
      pushToast({ tone: "error", title: "Clipboard access is not available" });
      return;
    }

    navigator.clipboard.writeText(url).then(() => {
      pushToast({ tone: "success", title: "Profile link copied" });
    });
  }

  return (
    <div className="page-section">
      <span className="page-label">Teacher Profile Page</span>
      <div className="profile-page">
        <div className="profile-topbar">
          <div className="ptbar-left">
            <button type="button" className="ptbar-link" onClick={() => router.push("/browse")}>Browse</button>
            <span className="ptbar-breadcrumb">/ {displayName}</span>
          </div>
          <div className="ptbar-right">
            <button type="button" className="ptbar-btn ptbar-share" onClick={handleShareProfile}>Share Profile</button>
            <button type="button" className="ptbar-btn ptbar-save" onClick={handleSaveProfile}>{isSavedByParent ? "Saved" : "Save"}</button>
          </div>
        </div>

        <div className="profile-hero-banner">
          <div className="phb-pattern" />
          <div className="phb-ring1" />
          <div className="phb-ring2" />
        </div>

        <div className="profile-body">
          <div className="profile-main">
            <div className="profile-identity">
              <div className="profile-avatar-wrap">
                <div className="profile-avatar">
                  {profilePhotoUrl && !photoFailed ? (
                    <img
                      src={profilePhotoUrl}
                      alt={displayName}
                      className="profile-avatar-image"
                      loading="lazy"
                      decoding="async"
                      onError={() => setPhotoFailed(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="profile-avail-badge">
                  <div className="avail-green-dot" />
                  {teacher.availability.length ? "Available" : "Unavailable"}
                </div>
              </div>
              <div className="profile-name-block">
                <h1 className="profile-name">{displayName}</h1>
                <p className="profile-handle text-sm text-[var(--muted)]">{displayHandle}</p>
                <p className="profile-tagline">{subjectPills.join(" · ")} · {localityLabel} · {displayExperience}</p>
                <div className="profile-badges-row">
                  <span className="badge badge-verified">Live profile</span>
                  <span className="badge badge-demo">WhatsApp replies</span>
                  {!isPublicProfileVisible ? <span className="badge badge-pending">Not Public Yet</span> : null}
                </div>
              </div>
            </div>

            <div className="profile-stats-strip">
              <div className="pstat-box"><span className="pstat-num">{displayExperienceYears}</span><span className="pstat-lbl">Years experience</span></div>
              <div className="pstat-box"><span className="pstat-num">{teacher.subjects.length}</span><span className="pstat-lbl">Subjects</span></div>
              <div className="pstat-box"><span className="pstat-num">{teacher.grades.length}</span><span className="pstat-lbl">Grades</span></div>
              <div className="pstat-box"><span className="pstat-num">{teacher.availability.length}</span><span className="pstat-lbl">Availability slots</span></div>
              <div className="pstat-box"><span className="pstat-num">{displayContacts === "—" ? "0" : displayContacts}</span><span className="pstat-lbl">Contacts this week</span></div>
            </div>

            <div className="profile-section">
              <div className="profile-sec-title">About</div>
              <p className={`profile-bio ${isMutedBio ? "muted-bio" : ""}`}>{displayBio}</p>
            </div>

            <div className="profile-section">
              <div className="profile-sec-title">Subjects Taught</div>
              <div className="profile-subjects">
                {subjectPills.map((item) => <span key={item} className="profile-subj">{item}</span>)}
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-sec-title">Details</div>
              <div className="profile-details-grid">
                <div className="pdetail-box"><div className="pdb-icon">📚</div><div className="pdb-label">Grades</div><div className="pdb-val">{gradesLabel}</div></div>
                <div className="pdetail-box"><div className="pdb-icon">📋</div><div className="pdb-label">Board</div><div className="pdb-val">{boardsLabel}</div></div>
                <div className="pdetail-box"><div className="pdb-icon">🏠</div><div className="pdb-label">Teaches At</div><div className="pdb-val capitalize">{teachesAtLabel}</div></div>
                <div className="pdetail-box"><div className="pdb-icon">🕐</div><div className="pdb-label">Availability</div><div className="pdb-val">{availabilityLabel}</div></div>
                <div className="pdetail-box"><div className="pdb-icon">📍</div><div className="pdb-label">Locality</div><div className="pdb-val">{localityLabel}</div></div>
                <div className="pdetail-box"><div className="pdb-icon">₹</div><div className="pdb-label">Price</div><div className="pdb-val green">{priceLabel}</div></div>
              </div>
            </div>

            <div className="profile-section">
              <div className="profile-sec-title">Write a Review</div>
              {isParent ? (
                <form onSubmit={handleReviewSubmit} className="grid gap-4 rounded-[1.2rem] border border-[var(--border)] bg-white p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="form-label" htmlFor="review-parent-name">Your name</label>
                      <input id="review-parent-name" className="form-input" value={parentName} onChange={(event) => setParentName(event.target.value)} placeholder="Parent name" />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="review-rating">Rating</label>
                      <select id="review-rating" className="form-input" value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                        {[5, 4, 3, 2, 1].map((value) => (
                          <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="review-comment">Review</label>
                    <textarea id="review-comment" className="form-input min-h-[120px]" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write about teaching quality, punctuality, and outcomes..." />
                  </div>
                  <button type="submit" className="btn-primary w-fit px-5 py-3 text-sm">{existingReview ? "Update review" : "Post review"}</button>
                </form>
              ) : (
                <div className="review-card">
                  <p className="text-sm text-[var(--muted)]">Login as a parent to leave a review for this teacher.</p>
                  <button type="button" onClick={() => router.push(`/auth?role=parent&next=/teacher/${teacher.id}`)} className="btn-primary mt-4 px-5 py-3 text-sm">Login to review</button>
                </div>
              )}
            </div>

            <div className="profile-section">
              <div className="profile-sec-title">Other tutors in {localityLabel}</div>
              <div className="similar-row">
                {similarTeachers.length ? similarTeachers.map((item) => (
                  <button key={item.id} type="button" className="similar-mini" onClick={() => router.push(`/teacher/${item.id}`)}>
                    <div className="sim-avatar">{initialsFromName(item.name)}</div>
                    <div className="sim-name">{item.name}</div>
                    <div className="sim-subj">{item.subjects.slice(0, 2).join(" · ")}</div>
                    <div className="sim-price">{formatCurrency(item.price_per_month)}/mo</div>
                  </button>
                )) : <div className="review-card">No similar tutors yet.</div>}
              </div>
            </div>
          </div>

          <aside className="profile-sidebar">
            <div className="contact-card">
              <div className="cc-price">{priceLabel}</div>
              <div className="cc-price-note">Per student · per month</div>
              {isParent ? (
                <button
                  type="button"
                  onClick={handleContactTeacher}
                  disabled={isContactLoading}
                  ref={whatsappButtonRef}
                  className="btn-whatsapp whatsapp-pulse"
                >
                  <span>💬</span>{isContactLoading ? "Fetching contact..." : "Contact on WhatsApp"}
                </button>
              ) : isTeacherSession ? (
                <button type="button" disabled className="btn-whatsapp opacity-80">Contact unavailable to teachers</button>
              ) : (
                <button type="button" onClick={() => setShowContactLoginModal(true)} className="btn-whatsapp">Login to Contact</button>
              )}
              {isParent ? (
                <button type="button" onClick={handleSaveProfile} className="btn-save-profile">
                  {isSavedByParent ? "Saved" : "Save Profile"}
                </button>
              ) : isTeacherSession ? (
                <button type="button" onClick={() => router.push("/teacher/dashboard")} className="btn-save-profile">Open Dashboard</button>
              ) : (
                <button type="button" onClick={() => router.push(`/auth?role=parent&next=/teacher/${teacher.id}`)} className="btn-save-profile secondary-outline">Login to Save</button>
              )}
            </div>

            <div className="sidebar-info">
              <div className="sinfo-row"><div className="sinfo-icon" aria-hidden="true"><SidebarGlyph kind="location" /></div><div><div className="sinfo-label">Location</div><div className="sinfo-val">{localityLabel}</div></div></div>
              <div className="sinfo-row"><div className="sinfo-icon" aria-hidden="true"><SidebarGlyph kind="availability" /></div><div><div className="sinfo-label">Availability</div><div className="sinfo-val">{availabilityLabel}</div></div></div>
              <div className="sinfo-row"><div className="sinfo-icon" aria-hidden="true"><SidebarGlyph kind="response" /></div><div><div className="sinfo-label">Response time</div><div className="sinfo-val">Usually within 1 hour</div></div></div>
              <div className="sinfo-row"><div className="sinfo-icon" aria-hidden="true"><SidebarGlyph kind="contact" /></div><div><div className="sinfo-label">Parents contacted</div><div className="sinfo-val">{displayContacts === "—" ? "—" : `${displayContacts} this week`}</div></div></div>
            </div>
          </aside>
        </div>
      </div>

      {showContactLoginModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="card-surface w-full max-w-md rounded-[1.5rem] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Contact teacher</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)]">Login as parent to continue</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Only logged-in parents can contact teachers directly on WhatsApp.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="btn-secondary w-full px-4 py-3 text-sm"
                onClick={() => setShowContactLoginModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary w-full px-4 py-3 text-sm"
                onClick={() => router.push(`/auth?role=parent&next=/teacher/${teacher.id}`)}
              >
                Login as Parent
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
