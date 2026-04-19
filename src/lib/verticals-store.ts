import { createId } from "@/lib/utils";
import { createUniqueHandle } from "@/lib/handles";
import { seedCoachingInstitutes, seedSchools, type CoachingInstitute, type SchoolRecord } from "@/lib/verticals-data";

export type CoachingEnquiry = {
  id: string;
  instituteId: string;
  instituteName: string;
  name: string;
  phone: string;
  email: string;
  courseInterest: string;
  message: string;
  createdAt: string;
};

export type SchoolEnquiry = {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
};

type VerticalAnalytics = {
  coaching: Record<string, { profileViews: number; whatsappClicks: number; saves: number }>;
  schools: Record<string, { profileViews: number; saves: number }>;
};

type VerticalStorageState = {
  coaching: CoachingInstitute[];
  schools: SchoolRecord[];
  coachingEnquiries: CoachingEnquiry[];
  schoolEnquiries: SchoolEnquiry[];
  analytics: VerticalAnalytics;
  adminNotifications: Array<{
    id: string;
    vertical: "coaching" | "schools";
    entityId: string;
    name: string;
    status: "pending";
    createdAt: string;
  }>;
};

const STORAGE_KEY = "docent.verticals.v1";

function emptyState(): VerticalStorageState {
  return {
    coaching: [],
    schools: [],
    coachingEnquiries: [],
    schoolEnquiries: [],
    analytics: { coaching: {}, schools: {} },
    adminNotifications: [],
  };
}

function readState(): VerticalStorageState {
  if (typeof window === "undefined") {
    return emptyState();
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = emptyState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<VerticalStorageState>;
    return {
      coaching: parsed.coaching ?? [],
      schools: parsed.schools ?? [],
      coachingEnquiries: parsed.coachingEnquiries ?? [],
      schoolEnquiries: parsed.schoolEnquiries ?? [],
      analytics: parsed.analytics ?? { coaching: {}, schools: {} },
      adminNotifications: parsed.adminNotifications ?? [],
    };
  } catch {
    const initial = emptyState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

function writeState(next: VerticalStorageState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function notifyVerticalChange(eventName: "docent-coaching-change" | "docent-schools-change") {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(eventName));
}

function notifyAdmin(vertical: "coaching" | "schools", entityId: string, name: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("docent-admin-notification", {
      detail: { vertical, entityId, name, status: "pending" as const },
    }),
  );
}

export function loadVerticalDrafts() {
  return readState();
}

export function listCustomCoachingInstitutes() {
  return readState().coaching;
}

export function listCustomSchools() {
  return readState().schools;
}

export function createCoachingInstituteRegistration(
  institute: Omit<
    CoachingInstitute,
    "id" | "handle" | "createdAt" | "status" | "rating" | "reviewsCount" | "students" | "featured" | "iitSelections" | "neetSelections" | "passRate" | "bestRank" | "faculty"
  >,
) {
  const snapshot = readState();
  const existingHandles = [
    ...snapshot.coaching.map((item) => item.handle),
    ...snapshot.schools.map((item) => item.handle),
    ...seedCoachingInstitutes.map((item) => item.handle),
  ].filter((handle): handle is string => Boolean(handle));

  const nextInstitute: CoachingInstitute = {
    ...institute,
    id: createId("coaching"),
    handle: createUniqueHandle(institute.name, existingHandles, "coaching"),
    status: "pending",
    rating: 0,
    reviewsCount: 0,
    students: 0,
    iitSelections: 0,
    neetSelections: 0,
    passRate: 0,
    bestRank: "N/A",
    faculty: [],
    featured: false,
    createdAt: new Date().toISOString(),
  };

  const next: VerticalStorageState = {
    ...snapshot,
    coaching: [nextInstitute, ...snapshot.coaching],
    adminNotifications: [
      {
        id: createId("admin-note"),
        vertical: "coaching",
        entityId: nextInstitute.id,
        name: nextInstitute.name,
        status: "pending",
        createdAt: nextInstitute.createdAt,
      },
      ...snapshot.adminNotifications,
    ],
  };

  writeState(next);
  notifyVerticalChange("docent-coaching-change");
  notifyAdmin("coaching", nextInstitute.id, nextInstitute.name);
  return nextInstitute;
}

export function createSchoolRegistration(
  school: Omit<SchoolRecord, "id" | "handle" | "createdAt" | "status" | "rating" | "reviewsCount" | "students" | "teachers" | "featured">,
) {
  const snapshot = readState();
  const existingHandles = [
    ...snapshot.schools.map((item) => item.handle),
    ...snapshot.coaching.map((item) => item.handle),
    ...seedSchools.map((item) => item.handle),
  ].filter((handle): handle is string => Boolean(handle));

  const nextSchool: SchoolRecord = {
    ...school,
    id: createId("school"),
    handle: createUniqueHandle(school.name, existingHandles, "school"),
    status: "pending",
    rating: 0,
    reviewsCount: 0,
    students: 0,
    teachers: 0,
    featured: false,
    createdAt: new Date().toISOString(),
  };

  const next: VerticalStorageState = {
    ...snapshot,
    schools: [nextSchool, ...snapshot.schools],
    adminNotifications: [
      {
        id: createId("admin-note"),
        vertical: "schools",
        entityId: nextSchool.id,
        name: nextSchool.name,
        status: "pending",
        createdAt: nextSchool.createdAt,
      },
      ...snapshot.adminNotifications,
    ],
  };

  writeState(next);
  notifyVerticalChange("docent-schools-change");
  notifyAdmin("schools", nextSchool.id, nextSchool.name);
  return nextSchool;
}

export function createCoachingEnquiry(enquiry: Omit<CoachingEnquiry, "id" | "createdAt">) {
  const snapshot = readState();
  const nextEnquiry: CoachingEnquiry = {
    ...enquiry,
    id: createId("enquiry"),
    createdAt: new Date().toISOString(),
  };

  const next: VerticalStorageState = {
    ...snapshot,
    coachingEnquiries: [nextEnquiry, ...snapshot.coachingEnquiries],
  };

  writeState(next);
  return nextEnquiry;
}

export function createSchoolEnquiry(enquiry: Omit<SchoolEnquiry, "id" | "createdAt">) {
  const snapshot = readState();
  const nextEnquiry: SchoolEnquiry = {
    ...enquiry,
    id: createId("school-enquiry"),
    createdAt: new Date().toISOString(),
  };

  const next: VerticalStorageState = {
    ...snapshot,
    schoolEnquiries: [nextEnquiry, ...snapshot.schoolEnquiries],
  };

  writeState(next);
  return nextEnquiry;
}

export function listCoachingEnquiries(instituteId?: string) {
  const all = readState().coachingEnquiries;
  if (!instituteId) {
    return all;
  }

  return all.filter((item) => item.instituteId === instituteId);
}

export function listSchoolEnquiries(schoolId?: string) {
  const all = readState().schoolEnquiries;
  if (!schoolId) {
    return all;
  }

  return all.filter((item) => item.schoolId === schoolId);
}

export function setCoachingInstituteStatus(id: string, status: CoachingInstitute["status"]) {
  const snapshot = readState();
  const next: VerticalStorageState = {
    ...snapshot,
    coaching: snapshot.coaching.map((item) => (item.id === id ? { ...item, status } : item)),
  };

  writeState(next);
  notifyVerticalChange("docent-coaching-change");
}

export function setSchoolStatus(id: string, status: SchoolRecord["status"]) {
  const snapshot = readState();
  const next: VerticalStorageState = {
    ...snapshot,
    schools: snapshot.schools.map((item) => (item.id === id ? { ...item, status } : item)),
  };

  writeState(next);
  notifyVerticalChange("docent-schools-change");
}

export function updateSchoolAdmissionSettings(id: string, patch: Pick<SchoolRecord, "admissionOpen" | "admissionDeadline">) {
  const snapshot = readState();
  const next: VerticalStorageState = {
    ...snapshot,
    schools: snapshot.schools.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  };

  writeState(next);
  notifyVerticalChange("docent-schools-change");
}

export function trackCoachingMetric(id: string, metric: "profileViews" | "whatsappClicks" | "saves") {
  const snapshot = readState();
  const current = snapshot.analytics.coaching[id] ?? { profileViews: 0, whatsappClicks: 0, saves: 0 };
  const next: VerticalStorageState = {
    ...snapshot,
    analytics: {
      ...snapshot.analytics,
      coaching: {
        ...snapshot.analytics.coaching,
        [id]: {
          ...current,
          [metric]: current[metric] + 1,
        },
      },
    },
  };

  writeState(next);
}

export function trackSchoolMetric(id: string, metric: "profileViews" | "saves") {
  const snapshot = readState();
  const current = snapshot.analytics.schools[id] ?? { profileViews: 0, saves: 0 };
  const next: VerticalStorageState = {
    ...snapshot,
    analytics: {
      ...snapshot.analytics,
      schools: {
        ...snapshot.analytics.schools,
        [id]: {
          ...current,
          [metric]: current[metric] + 1,
        },
      },
    },
  };

  writeState(next);
}

export function getCoachingMetrics(id: string) {
  return readState().analytics.coaching[id] ?? { profileViews: 0, whatsappClicks: 0, saves: 0 };
}

export function getSchoolMetrics(id: string) {
  return readState().analytics.schools[id] ?? { profileViews: 0, saves: 0 };
}

export function latestCoachingSubmission() {
  return readState().coaching[0] ?? null;
}

export function latestSchoolSubmission() {
  return readState().schools[0] ?? null;
}
