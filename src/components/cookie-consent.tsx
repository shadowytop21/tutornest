"use client";

import { useEffect, useMemo, useState } from "react";

type CookieConsentValue = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  updatedAt: string;
};

const COOKIE_NAME = "docent_cookie_consent";
const COOKIE_VERSION = "2026-04";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readConsent(): CookieConsentValue | null {
  if (typeof document === "undefined") {
    return null;
  }

  const rawCookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!rawCookie) {
    return null;
  }

  try {
    const value = decodeURIComponent(rawCookie.split("=")[1] ?? "");
    const parsed = JSON.parse(value) as Partial<CookieConsentValue>;

    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }

    return {
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      version: parsed.version ?? COOKIE_VERSION,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function persistConsent(consent: CookieConsentValue) {
  const encoded = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_NAME}=${encoded}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax`;
}

export function CookieConsent() {
  const initial = useMemo(readConsent, []);
  const [open, setOpen] = useState(!initial);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);

  useEffect(() => {
    const handleOpenSettings = () => setOpen(true);
    window.addEventListener("docent-open-cookie-settings", handleOpenSettings);

    return () => {
      window.removeEventListener("docent-open-cookie-settings", handleOpenSettings);
    };
  }, []);

  function save(next: Pick<CookieConsentValue, "analytics" | "marketing">) {
    persistConsent({
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing,
      version: COOKIE_VERSION,
      updatedAt: new Date().toISOString(),
    });

    setAnalytics(next.analytics);
    setMarketing(next.marketing);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="cookie-manage-btn"
        onClick={() => setOpen(true)}
      >
        Cookie settings
      </button>
    );
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-banner-title">Cookie Preferences</div>
      <p className="cookie-banner-text">
        We use cookies to run core features and, with your permission, analytics and marketing tools.
      </p>

      <div className="cookie-grid">
        <label className="cookie-option">
          <input type="checkbox" checked disabled />
          <span>
            <strong>Essential</strong>
            <small>Always on for authentication and security.</small>
          </span>
        </label>

        <label className="cookie-option">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(event) => setAnalytics(event.target.checked)}
          />
          <span>
            <strong>Analytics</strong>
            <small>Understand usage trends and improve tutor discovery.</small>
          </span>
        </label>

        <label className="cookie-option">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
          />
          <span>
            <strong>Marketing</strong>
            <small>Measure campaigns and send relevant announcements.</small>
          </span>
        </label>
      </div>

      <div className="cookie-actions">
        <button type="button" className="btn-secondary" onClick={() => save({ analytics: false, marketing: false })}>
          Reject optional
        </button>
        <button type="button" className="btn-secondary" onClick={() => save({ analytics, marketing })}>
          Save preferences
        </button>
        <button type="button" className="btn-primary" onClick={() => save({ analytics: true, marketing: true })}>
          Accept all
        </button>
      </div>
    </div>
  );
}
