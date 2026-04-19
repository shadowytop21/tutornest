import { loadAppState } from "@/lib/mock-db";
import { seedCoachingInstitutes, seedSchools } from "@/lib/verticals-data";
import { listCustomCoachingInstitutes, listCustomSchools } from "@/lib/verticals-store";

export type LiveVerticalCounts = {
  tutors: number;
  coaching: number;
  schools: number;
};

function countVerifiedCoachingInstitutes() {
  return [...seedCoachingInstitutes, ...listCustomCoachingInstitutes()].filter((item) => item.status === "verified").length;
}

function countVerifiedSchools() {
  return [...seedSchools, ...listCustomSchools()].filter((item) => item.status === "verified").length;
}

function countVisibleTutorsFallback() {
  return loadAppState().teachers.filter((teacher) => teacher.status !== "rejected").length;
}

export async function loadLiveVerticalCounts(): Promise<LiveVerticalCounts> {
  let tutors = countVisibleTutorsFallback();

  if (typeof window !== "undefined") {
    try {
      const response = await fetch("/api/browse?limit=1&page=1&includeFacets=0", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as { total?: number; offline?: boolean };
        if (!payload.offline && typeof payload.total === "number") {
          tutors = payload.total;
        }
      }
    } catch {
      tutors = countVisibleTutorsFallback();
    }
  }

  return {
    tutors,
    coaching: countVerifiedCoachingInstitutes(),
    schools: countVerifiedSchools(),
  };
}
