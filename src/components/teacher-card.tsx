import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { type TeacherProfile } from "@/lib/data";

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "green" | "saffron" | "blue" }) {
  const style =
    tone === "green"
      ? "badge-verified"
      : tone === "saffron"
        ? "badge-founding"
        : tone === "blue"
          ? "badge-new"
          : "badge-unavail";

  return <span className={`badge ${style}`}>{children}</span>;
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function displayExperienceYears(years: number) {
  if (!Number.isFinite(years) || years <= 0 || years > 40) {
    return "—";
  }

  return String(Math.round(years));
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

function TeacherCardImpl({ teacher }: { teacher: TeacherProfile }) {
  function prewarmTeacherProfile() {
    void fetch(`/api/teacher/${teacher.id}`, { cache: "force-cache" });
  }

  const [photoFailed, setPhotoFailed] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const initials = initialsFromName(teacher.name);
  const profilePhotoUrl = useMemo(() => normalizePhotoUrl(teacher.photo_url), [teacher.photo_url]);

  useEffect(() => {
    setPhotoFailed(false);
  }, [teacher.id, profilePhotoUrl]);

  useEffect(() => {
    if (!teacher.created_at) {
      setIsNew(false);
      return;
    }

    const createdAtMs = new Date(teacher.created_at).getTime();
    if (Number.isNaN(createdAtMs)) {
      setIsNew(false);
      return;
    }

    const ageInDays = (Date.now() - createdAtMs) / (1000 * 60 * 60 * 24);
    setIsNew(ageInDays <= 45);
  }, [teacher.created_at]);

  const isUnavailable = teacher.availability.length === 0;
  const availabilityLabel = teacher.availability.length ? teacher.availability.join(" + ") : "Unavailable";
  const boardLabel = teacher.boards.length ? teacher.boards.join(" / ") : "Not specified";
  const experienceLabel = displayExperienceYears(teacher.experience_years);

  return (
    <article className={`teacher-card tcard group ${isUnavailable ? "tcard-unavailable" : ""}`}>
      <div className="tcard-band" />
      <div className="tcard-header">
        <button type="button" className="tcard-bookmark" aria-label="Save teacher profile">
          <svg className="tcard-heart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 21s-7.4-4.6-9.2-8.3C1.3 9.8 2.3 6.4 5.3 5c2-.9 4.4-.5 6.1 1.2L12 6.8l.6-.6c1.7-1.7 4.1-2.1 6.1-1.2 3 1.4 4 4.8 2.5 7.7C19.4 16.4 12 21 12 21z" />
          </svg>
        </button>
        <div className="tcard-top-row">
          <div className="tcard-avatar relative">
            {profilePhotoUrl && !photoFailed ? (
              <img
                src={profilePhotoUrl}
                alt={teacher.name}
                className="tcard-avatar-image"
                loading="lazy"
                decoding="async"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <span className="font-display text-base font-semibold text-[#1A2744]">{initials}</span>
            )}
            <span className="online-dot" />
          </div>

          <div className="tcard-name-block">
            <div className="tcard-name">{teacher.name}</div>
            <div className="tcard-loc">{teacher.locality} · {experienceLabel === "—" ? "—" : `${experienceLabel} yrs`}</div>
          </div>
        </div>

        <div className="tcard-badges">
          {teacher.status === "verified" ? <Badge tone="green">Verified</Badge> : null}
          {teacher.is_founding_member ? <Badge tone="saffron">Founding</Badge> : null}
          {isNew ? <Badge tone="blue">New</Badge> : null}
          {isUnavailable ? <Badge>Unavailable</Badge> : null}
        </div>

        <div className="tcard-subjects">
          {teacher.subjects.slice(0, 3).map((subject) => (
            <span key={subject} className="subj-pill">
              {subject}
            </span>
          ))}
        </div>

        <div className="tcard-details">
          <div className="tcd-item">
            <div className="tcd-label">Grades</div>
            <div className="tcd-val">{teacher.grades.join(", ")}</div>
          </div>
          <div className="tcd-item">
            <div className="tcd-label">Board</div>
            <div className="tcd-val">{boardLabel}</div>
          </div>
          <div className="tcd-item">
            <div className="tcd-label">Teaches At</div>
            <div className="tcd-val">{teacher.teaches_at.replace("_", " ")}</div>
          </div>
          <div className="tcd-item">
            <div className="tcd-label">Availability</div>
            <div className="tcd-val">{availabilityLabel}</div>
          </div>
        </div>

        <div className="tcard-rating-row">
          <span className="rating-count">{teacher.subjects.slice(0, 2).join(" · ") || "Teacher profile"}</span>
          <span className="views-pill">{teacher.experience_years} yrs experience</span>
        </div>
      </div>

      <div className="tcard-footer">
        <div>
          <div className="tcard-price">₹{teacher.price_per_month} <span>/ mo</span></div>
        </div>

        <Link
          href={`/teacher/${teacher.id}`}
          className={`tcard-btn ${isUnavailable ? "card-btn-muted" : ""}`}
          onMouseEnter={prewarmTeacherProfile}
          onFocus={prewarmTeacherProfile}
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}

export const TeacherCard = memo(TeacherCardImpl);
