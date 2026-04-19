"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { seedSchools, type SchoolRecord } from "@/lib/verticals-data";
import { listCustomSchools } from "@/lib/verticals-store";

function getSchoolMap(schools: SchoolRecord[]) {
  return new Map(schools.map((item) => [item.id, item]));
}

export default function SchoolsComparePage() {
  const searchParams = useSearchParams();
  const [customSchools, setCustomSchools] = useState<SchoolRecord[]>([]);

  useEffect(() => {
    const load = () => setCustomSchools(listCustomSchools());
    load();
    window.addEventListener("docent-schools-change", load);
    return () => window.removeEventListener("docent-schools-change", load);
  }, []);

  const schools = useMemo(() => [...customSchools, ...seedSchools], [customSchools]);

  const selected = useMemo(() => {
    const ids = (searchParams.get("ids") || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3);

    const map = getSchoolMap(schools);
    return ids.map((id) => map.get(id)).filter((item): item is SchoolRecord => Boolean(item));
  }, [schools, searchParams]);

  if (selected.length < 2) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-display text-4xl text-[var(--navy)]">Select at least 2 schools to compare</h1>
        <p className="mt-3 text-[var(--muted)]">Go back to schools browse and add schools to compare.</p>
        <Link href="/schools" className="btn-primary mt-8 inline-flex px-6 py-3 text-sm">Back to Schools</Link>
      </div>
    );
  }

  const rows: Array<{ label: string; value: (school: SchoolRecord) => string }> = [
    { label: "Board", value: (school) => school.boards.join(" / ") },
    { label: "School Type", value: (school) => school.schoolType },
    { label: "Classes", value: (school) => school.classesRange },
    { label: "Annual Fees", value: (school) => `${formatCurrency(school.annualFeeMin)} - ${formatCurrency(school.annualFeeMax)}` },
    { label: "Students", value: (school) => String(school.studentCount || school.students || "-") },
    { label: "Teachers", value: (school) => String(school.teacherCount || school.teachers || "-") },
    { label: "School Hours", value: (school) => school.schoolHours || "-" },
    { label: "Facilities", value: (school) => school.facilities.join(", ") },
    { label: "Admission", value: (school) => (school.admissionOpen ? `Open (Deadline: ${school.admissionDeadline || "N/A"})` : "Closed") },
    { label: "Transport", value: (school) => (school.transportAvailable ? `Available (${formatCurrency(school.transportFee)}/yr)` : "Not Available") },
    { label: "Affiliation No.", value: (school) => school.affiliationNumber || "-" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Schools Compare</p>
          <h1 className="mt-2 font-display text-4xl text-[var(--navy)]">Side by Side Comparison</h1>
        </div>
        <Link href="/schools" className="btn-secondary px-4 py-2 text-sm">Back to Browse</Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--ivory)]">
              <th className="px-4 py-4 text-left font-semibold text-[var(--muted)]">Metric</th>
              {selected.map((school) => (
                <th key={school.id} className="min-w-[240px] px-4 py-4 text-left">
                  <p className="font-display text-xl text-[var(--navy)]">{school.name}</p>
                  <p className="text-xs text-[var(--muted)]">{school.locality}, Mathura</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-[var(--border)] align-top last:border-b-0">
                <td className="px-4 py-3 font-semibold text-[var(--navy)]">{row.label}</td>
                {selected.map((school) => (
                  <td key={`${row.label}-${school.id}`} className="px-4 py-3 text-[var(--muted)]">{row.value(school)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3 font-semibold text-[var(--navy)]">Profile</td>
              {selected.map((school) => (
                <td key={`profile-${school.id}`} className="px-4 py-3">
                  <Link href={`/schools/${school.id}`} className="btn-primary inline-flex px-4 py-2 text-xs">View School</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
