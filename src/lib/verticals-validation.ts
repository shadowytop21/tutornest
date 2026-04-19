import { coachingExamTypes, type CoachingExamType } from "@/lib/verticals-data";

const LETTERS_ONLY = /^[A-Za-z .'-]+$/;

export function normalizeLettersOnly(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function validateInstituteName(value: string) {
  const normalized = normalizeLettersOnly(value);
  if (!normalized) {
    return "Institute name is required";
  }

  if (normalized.length < 3 || normalized.length > 80) {
    return "Institute name must be between 3 and 80 characters";
  }

  if (!LETTERS_ONLY.test(normalized)) {
    return "Institute name can include letters, spaces, apostrophes, dots, and hyphens only";
  }

  return null;
}

export function validateTagline(value: string) {
  const normalized = value.trim();
  if (normalized.length > 100) {
    return "Tagline must be 100 characters or less";
  }

  return null;
}

export function validateAbout(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "About section is required";
  }

  if (normalized.length < 50) {
    return "About section must be at least 50 characters";
  }

  return null;
}

export function parseEstablishedYear(value: string) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1900 || numeric > 2025) {
    return {
      value: null,
      error: "Established year must be between 1900 and 2025",
    };
  }

  return {
    value: numeric,
    error: null,
  };
}

export function normalizeIndianPhone(value: string) {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2);
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return digitsOnly.slice(1);
  }

  return digitsOnly;
}

export function validateIndianPhone(value: string) {
  const normalized = normalizeIndianPhone(value);
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    return {
      value: null,
      error: "Enter a valid Indian 10-digit phone number",
    };
  }

  return {
    value: normalized,
    error: null,
  };
}

export function validateWebsite(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes(".")) {
      return "Enter a valid website URL";
    }
    return null;
  } catch {
    return "Enter a valid website URL";
  }
}

export function normalizeWebsite(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
}

export function parsePositiveInt(value: string, min = 1, max = Number.MAX_SAFE_INTEGER) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < min || numeric > max) {
    return null;
  }

  return numeric;
}

export function validateExamTypes(values: string[]) {
  if (!values.length) {
    return "Select at least one exam type";
  }

  return null;
}

export function isCoachingExamType(value: string): value is CoachingExamType {
  return (coachingExamTypes as readonly string[]).includes(value);
}
