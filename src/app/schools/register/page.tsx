"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";
import { localityOptions } from "@/lib/data";
import { createId } from "@/lib/utils";
import {
  classLevelOptions,
  schoolBoardOptions,
  schoolFacilities,
  schoolTypeOptions,
  type ClassLevel,
  type SchoolBoard,
  type SchoolClassFee,
  type SchoolFacility,
  type SchoolType,
} from "@/lib/verticals-data";
import { createSchoolRegistration } from "@/lib/verticals-store";
import { parseEstablishedYear, parsePositiveInt, validateAbout, validateInstituteName, validateTagline } from "@/lib/verticals-validation";

const steps = ["Basic Info", "Academic Details", "Admission & Location"];

const ALLOWED_LOGO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_DOC_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_DOC_BYTES = 5 * 1024 * 1024;

const classOrder = classLevelOptions.reduce<Record<string, number>>((acc, item, index) => {
  acc[item] = index;
  return acc;
}, {});

type ClassFeeDraft = {
  id: string;
  label: string;
  annualFee: string;
};

const blankClassFee = (): ClassFeeDraft => ({
  id: createId("school-class-fee"),
  label: "",
  annualFee: "",
});

export default function SchoolsRegisterPage() {
  const { pushToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    schoolName: "",
    tagline: "",
    about: "",
    logoUrl: "",
    establishedYear: "",
    boards: ["CBSE"] as SchoolBoard[],
    schoolType: "Co-Education" as SchoolType,
    affiliationNumber: "",
    classesFrom: "Nursery" as ClassLevel,
    classesTo: "Class 12" as ClassLevel,
    classFees: [blankClassFee()],
    studentCount: "",
    teacherCount: "",
    schoolHours: "",
    facilities: [] as SchoolFacility[],
    locality: "",
    fullAddress: "",
    transportAvailable: false,
    transportFee: "",
    admissionOpen: true,
    admissionDeadline: "",
    verificationDocuments: [] as string[],
  });

  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  function toggleBoard(board: SchoolBoard) {
    setForm((current) => ({
      ...current,
      boards: current.boards.includes(board) ? current.boards.filter((item) => item !== board) : [...current.boards, board],
    }));
  }

  function toggleFacility(facility: SchoolFacility) {
    setForm((current) => ({
      ...current,
      facilities: current.facilities.includes(facility)
        ? current.facilities.filter((item) => item !== facility)
        : [...current.facilities, facility],
    }));
  }

  function updateClassFee(id: string, patch: Partial<ClassFeeDraft>) {
    setForm((current) => ({
      ...current,
      classFees: current.classFees.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function addClassFee() {
    setForm((current) => ({ ...current, classFees: [...current.classFees, blankClassFee()] }));
  }

  function removeClassFee(id: string) {
    setForm((current) => ({
      ...current,
      classFees: current.classFees.length === 1 ? current.classFees : current.classFees.filter((item) => item.id !== id),
    }));
  }

  function handleLogoUpload(file: File | null) {
    if (!file) {
      setForm((current) => ({ ...current, logoUrl: "" }));
      return;
    }

    if (!ALLOWED_LOGO_TYPES.has(file.type)) {
      pushToast({ tone: "error", title: "Logo must be JPG, PNG, or WebP" });
      return;
    }

    if (file.size > MAX_LOGO_BYTES) {
      pushToast({ tone: "error", title: "Logo size must be 2MB or less" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, logoUrl: String(reader.result ?? "") }));
    reader.readAsDataURL(file);
  }

  function handleDocumentUpload(files: FileList | null) {
    if (!files || files.length === 0) {
      setForm((current) => ({ ...current, verificationDocuments: [] }));
      return;
    }

    const names: string[] = [];

    for (const file of Array.from(files)) {
      if (!ALLOWED_DOC_TYPES.has(file.type)) {
        pushToast({ tone: "error", title: `${file.name}: upload PDF/JPG/PNG/WebP only` });
        return;
      }

      if (file.size > MAX_DOC_BYTES) {
        pushToast({ tone: "error", title: `${file.name}: max size is 5MB` });
        return;
      }

      names.push(file.name);
    }

    setForm((current) => ({ ...current, verificationDocuments: names }));
  }

  function validateStep1() {
    const errors: Record<string, string> = {};

    const nameError = validateInstituteName(form.schoolName);
    if (nameError) errors.schoolName = nameError.replace("Institute", "School");

    const taglineError = validateTagline(form.tagline);
    if (taglineError) errors.tagline = taglineError;

    const aboutError = validateAbout(form.about);
    if (aboutError) errors.about = aboutError;

    const yearError = parseEstablishedYear(form.establishedYear).error;
    if (yearError) errors.establishedYear = yearError;

    if (form.boards.length === 0) errors.boards = "Select at least one board";
    if (!form.affiliationNumber.trim()) errors.affiliationNumber = "Affiliation number is required";

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep2() {
    const errors: Record<string, string> = {};

    if (classOrder[form.classesFrom] > classOrder[form.classesTo]) {
      errors.classRange = "Classes from cannot be after classes to";
    }

    const studentCount = parsePositiveInt(form.studentCount, 1, 200000);
    if (!studentCount) errors.studentCount = "Student count is required";

    const teacherCount = parsePositiveInt(form.teacherCount, 1, 20000);
    if (!teacherCount) errors.teacherCount = "Teacher count is required";

    if (!form.schoolHours.trim()) errors.schoolHours = "School hours are required";

    if (form.facilities.length === 0) errors.facilities = "Select at least one facility";

    const hasInvalidFeeRow = form.classFees.some((row) => !row.label.trim() || !parsePositiveInt(row.annualFee, 1000, 500000));
    if (hasInvalidFeeRow) errors.classFees = "Each class fee row must have class range and annual fee";

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep3() {
    const errors: Record<string, string> = {};

    if (!form.locality) errors.locality = "Select a locality";
    if (!form.fullAddress.trim()) errors.fullAddress = "Full address is required";

    if (form.transportAvailable) {
      const transportFee = parsePositiveInt(form.transportFee, 1000, 100000);
      if (!transportFee) errors.transportFee = "Enter transport fee when transport is available";
    }

    if (form.admissionOpen && !form.admissionDeadline) {
      errors.admissionDeadline = "Deadline date is required when admissions are open";
    }

    if (form.verificationDocuments.length === 0) {
      errors.verificationDocuments = "Upload at least one verification document";
    }

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function goNext() {
    if (currentStep === 0 && !validateStep1()) return;
    if (currentStep === 1 && !validateStep2()) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  function submit() {
    const valid1 = validateStep1();
    const valid2 = validateStep2();
    const valid3 = validateStep3();

    if (!valid1 || !valid2 || !valid3) {
      pushToast({ tone: "error", title: "Fix form errors before submitting" });
      return;
    }

    const establishedYear = parseEstablishedYear(form.establishedYear).value;
    const studentCount = parsePositiveInt(form.studentCount, 1, 200000);
    const teacherCount = parsePositiveInt(form.teacherCount, 1, 20000);

    if (!establishedYear || !studentCount || !teacherCount) {
      pushToast({ tone: "error", title: "Validation failed unexpectedly" });
      return;
    }

    const classFees: SchoolClassFee[] = form.classFees
      .map((row) => {
        const annualFee = parsePositiveInt(row.annualFee, 1000, 500000);
        if (!row.label.trim() || !annualFee) {
          return null;
        }

        return {
          id: row.id,
          label: row.label.trim(),
          annualFee,
        };
      })
      .filter((row): row is SchoolClassFee => Boolean(row));

    const annualFeeValues = classFees.map((item) => item.annualFee);
    const annualFeeMin = Math.min(...annualFeeValues);
    const annualFeeMax = Math.max(...annualFeeValues);

    createSchoolRegistration({
      name: form.schoolName.trim(),
      tagline: form.tagline.trim(),
      about: form.about.trim(),
      logoUrl: form.logoUrl,
      establishedYear,
      boards: form.boards,
      schoolType: form.schoolType,
      affiliationNumber: form.affiliationNumber.trim(),
      classesFrom: form.classesFrom,
      classesTo: form.classesTo,
      classesRange: `${form.classesFrom} - ${form.classesTo}`,
      locality: form.locality,
      fullAddress: form.fullAddress.trim(),
      annualFeeMin,
      annualFeeMax,
      facilities: form.facilities,
      classFees,
      studentCount,
      teacherCount,
      schoolHours: form.schoolHours.trim(),
      transportAvailable: form.transportAvailable,
      transportFee: form.transportAvailable ? parsePositiveInt(form.transportFee, 1000, 100000) ?? 0 : 0,
      admissionOpen: form.admissionOpen,
      admissionDeadline: form.admissionDeadline || "",
      gallery: [],
      contactPhone: "",
      website: "",
      verificationDocumentName: form.verificationDocuments.join(", "),
    });

    setSubmitted(true);
    pushToast({
      tone: "success",
      title: "School registration submitted",
      description: "Status set to pending and admin has been notified.",
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-light)] text-xl font-semibold text-[var(--green)]">Done</div>
          <h1 className="mt-6 font-display text-4xl font-bold text-[var(--foreground)]">School submitted for review</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Status is pending. Admin has been notified and verification is in progress.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/schools/dashboard" className="btn-primary px-6 py-3 text-sm">Go to dashboard</Link>
            <Link href="/schools" className="btn-secondary px-6 py-3 text-sm">Browse schools</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="card-surface rounded-[2rem] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">School onboarding</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-[var(--foreground)]">Register your school</h1>
          </div>
          <span className="pill pill-active">Step {currentStep + 1} of 3</span>
        </div>

        <div className="mt-6 h-3 rounded-full bg-[var(--surface-alt)]">
          <div className="h-full rounded-full bg-[#0D7377] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {steps.map((step, index) => (
            <span key={step} className={`pill ${index === currentStep ? "pill-active" : "pill-inactive"}`}>{step}</span>
          ))}
        </div>

        <div className="mt-8 space-y-8">
          {currentStep === 0 ? (
            <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-4">
                <label className="block rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[rgba(240,253,250,0.9)] p-6 text-center">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)} />
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 text-lg font-semibold text-[#0D7377]">
                    {form.logoUrl ? <img src={form.logoUrl} alt="School logo" className="h-full w-full object-cover" /> : "Logo"}
                  </div>
                  <span className="btn-secondary px-4 py-2 text-sm">Upload logo</span>
                </label>
                <p className="text-sm text-[var(--muted)]">JPG, PNG, or WebP only. Max size 2MB.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">School name *</label>
                  <input className="field" value={form.schoolName} onChange={(event) => setForm((current) => ({ ...current, schoolName: event.target.value }))} />
                  {step1Errors.schoolName ? <p className="mt-2 text-sm text-red-600">{step1Errors.schoolName}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Tagline</label>
                  <input className="field" maxLength={100} value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} />
                  {step1Errors.tagline ? <p className="mt-2 text-sm text-red-600">{step1Errors.tagline}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">About (min 50 chars)</label>
                  <textarea className="textarea" value={form.about} onChange={(event) => setForm((current) => ({ ...current, about: event.target.value }))} />
                  {step1Errors.about ? <p className="mt-2 text-sm text-red-600">{step1Errors.about}</p> : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Established year</label>
                    <input className="field" value={form.establishedYear} onChange={(event) => setForm((current) => ({ ...current, establishedYear: event.target.value.replace(/[^0-9]/g, "") }))} />
                    {step1Errors.establishedYear ? <p className="mt-2 text-sm text-red-600">{step1Errors.establishedYear}</p> : null}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Affiliation number</label>
                    <input className="field" value={form.affiliationNumber} onChange={(event) => setForm((current) => ({ ...current, affiliationNumber: event.target.value }))} />
                    {step1Errors.affiliationNumber ? <p className="mt-2 text-sm text-red-600">{step1Errors.affiliationNumber}</p> : null}
                  </div>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Board (multi-select)</p>
                  <div className="flex flex-wrap gap-2">
                    {schoolBoardOptions.map((board) => (
                      <button type="button" key={board} onClick={() => toggleBoard(board)} className={`pill ${form.boards.includes(board) ? "pill-active" : "pill-inactive"}`}>
                        {board}
                      </button>
                    ))}
                  </div>
                  {step1Errors.boards ? <p className="mt-2 text-sm text-red-600">{step1Errors.boards}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">School type</label>
                  <select className="select" value={form.schoolType} onChange={(event) => setForm((current) => ({ ...current, schoolType: event.target.value as SchoolType }))}>
                    {schoolTypeOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          ) : null}

          {currentStep === 1 ? (
            <section className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Classes from</label>
                  <select className="select" value={form.classesFrom} onChange={(event) => setForm((current) => ({ ...current, classesFrom: event.target.value as ClassLevel }))}>
                    {classLevelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Classes to</label>
                  <select className="select" value={form.classesTo} onChange={(event) => setForm((current) => ({ ...current, classesTo: event.target.value as ClassLevel }))}>
                    {classLevelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
                {step2Errors.classRange ? <p className="sm:col-span-2 text-sm text-red-600">{step2Errors.classRange}</p> : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Class fees (class range to annual fee)</p>
                  <button type="button" onClick={addClassFee} className="btn-secondary px-4 py-2 text-xs">Add class fee</button>
                </div>

                {form.classFees.map((row) => (
                  <article key={row.id} className="rounded-xl border border-[var(--border)] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="field" placeholder="e.g. Class 1-5" value={row.label} onChange={(event) => updateClassFee(row.id, { label: event.target.value })} />
                      <input className="field" placeholder="Annual fee (INR)" value={row.annualFee} onChange={(event) => updateClassFee(row.id, { annualFee: event.target.value.replace(/[^0-9]/g, "") })} />
                    </div>
                    <button type="button" onClick={() => removeClassFee(row.id)} className="mt-3 text-xs font-medium text-red-600">Remove row</button>
                  </article>
                ))}
                {step2Errors.classFees ? <p className="text-sm text-red-600">{step2Errors.classFees}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Student count</label>
                  <input className="field" value={form.studentCount} onChange={(event) => setForm((current) => ({ ...current, studentCount: event.target.value.replace(/[^0-9]/g, "") }))} />
                  {step2Errors.studentCount ? <p className="mt-2 text-sm text-red-600">{step2Errors.studentCount}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Teacher count</label>
                  <input className="field" value={form.teacherCount} onChange={(event) => setForm((current) => ({ ...current, teacherCount: event.target.value.replace(/[^0-9]/g, "") }))} />
                  {step2Errors.teacherCount ? <p className="mt-2 text-sm text-red-600">{step2Errors.teacherCount}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">School hours</label>
                  <input className="field" placeholder="7:30 AM - 2:30 PM" value={form.schoolHours} onChange={(event) => setForm((current) => ({ ...current, schoolHours: event.target.value }))} />
                  {step2Errors.schoolHours ? <p className="mt-2 text-sm text-red-600">{step2Errors.schoolHours}</p> : null}
                </div>
              </div>

              <div>
                <p className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Facilities (multi-select)</p>
                <div className="flex flex-wrap gap-2">
                  {schoolFacilities.map((facility) => (
                    <button key={facility} type="button" onClick={() => toggleFacility(facility)} className={`pill ${form.facilities.includes(facility) ? "pill-active" : "pill-inactive"}`}>
                      {facility}
                    </button>
                  ))}
                </div>
                {step2Errors.facilities ? <p className="mt-2 text-sm text-red-600">{step2Errors.facilities}</p> : null}
              </div>
            </section>
          ) : null}

          {currentStep === 2 ? (
            <section className="grid gap-5 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Locality</label>
                <select className="select" value={form.locality} onChange={(event) => setForm((current) => ({ ...current, locality: event.target.value }))}>
                  <option value="">Select locality</option>
                  {localityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                {step3Errors.locality ? <p className="mt-2 text-sm text-red-600">{step3Errors.locality}</p> : null}
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Transport available</p>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs ${form.transportAvailable ? "bg-[#0D7377] text-white" : "bg-[var(--surface-alt)] text-[var(--muted)]"}`}
                    onClick={() => setForm((current) => ({ ...current, transportAvailable: !current.transportAvailable, transportFee: current.transportAvailable ? "" : current.transportFee }))}
                  >
                    {form.transportAvailable ? "Yes" : "No"}
                  </button>
                </div>

                {form.transportAvailable ? (
                  <div className="mt-3">
                    <input className="field" placeholder="Transport fee (INR / year)" value={form.transportFee} onChange={(event) => setForm((current) => ({ ...current, transportFee: event.target.value.replace(/[^0-9]/g, "") }))} />
                    {step3Errors.transportFee ? <p className="mt-2 text-sm text-red-600">{step3Errors.transportFee}</p> : null}
                  </div>
                ) : null}
              </div>

              <div className="rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Admission open</p>
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs ${form.admissionOpen ? "bg-[#0D7377] text-white" : "bg-[var(--surface-alt)] text-[var(--muted)]"}`}
                    onClick={() => setForm((current) => ({ ...current, admissionOpen: !current.admissionOpen, admissionDeadline: current.admissionOpen ? "" : current.admissionDeadline }))}
                  >
                    {form.admissionOpen ? "Open" : "Closed"}
                  </button>
                </div>

                {form.admissionOpen ? (
                  <div className="mt-3">
                    <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Deadline date</label>
                    <input type="date" className="field" value={form.admissionDeadline} onChange={(event) => setForm((current) => ({ ...current, admissionDeadline: event.target.value }))} />
                    {step3Errors.admissionDeadline ? <p className="mt-2 text-sm text-red-600">{step3Errors.admissionDeadline}</p> : null}
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Full address</label>
                <textarea className="textarea" value={form.fullAddress} onChange={(event) => setForm((current) => ({ ...current, fullAddress: event.target.value }))} />
                {step3Errors.fullAddress ? <p className="mt-2 text-sm text-red-600">{step3Errors.fullAddress}</p> : null}
              </div>

              <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4">
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Document upload (affiliation + registration)</label>
                <input type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => handleDocumentUpload(event.target.files)} />
                <p className="mt-2 text-xs text-[var(--muted)]">Accepted formats: PDF, JPG, PNG, WebP. Max 5MB per file.</p>
                {form.verificationDocuments.length > 0 ? <p className="mt-2 text-sm text-[var(--navy)]">Selected: {form.verificationDocuments.join(", ")}</p> : null}
                {step3Errors.verificationDocuments ? <p className="mt-2 text-sm text-red-600">{step3Errors.verificationDocuments}</p> : null}
              </div>
            </section>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-[var(--border)] pt-6">
            <button type="button" onClick={goBack} disabled={currentStep === 0} className="btn-ghost px-5 py-3 text-sm disabled:opacity-40">Back</button>
            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={goNext} className="btn-primary px-5 py-3 text-sm">Continue</button>
            ) : (
              <button type="button" onClick={submit} className="btn-primary px-5 py-3 text-sm">Submit for verification</button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-4xl text-center text-sm text-[var(--muted)]">
        Need examples before registering? Explore <Link href="/schools" className="font-medium text-[#0D7377]">school browse</Link> to review listed profiles.
      </div>
    </div>
  );
}
