"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";
import { localityOptions } from "@/lib/data";
import { createId } from "@/lib/utils";
import { coachingExamTypes, type CoachingCourse, type CoachingExamType } from "@/lib/verticals-data";
import { createCoachingInstituteRegistration } from "@/lib/verticals-store";
import {
  isCoachingExamType,
  normalizeWebsite,
  parseEstablishedYear,
  parsePositiveInt,
  validateAbout,
  validateExamTypes,
  validateIndianPhone,
  validateInstituteName,
  validateTagline,
  validateWebsite,
} from "@/lib/verticals-validation";

const steps = ["Basic Info", "Courses & Details", "Location & Verification"];
const ALLOWED_UPLOAD_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

type CourseDraft = {
  id: string;
  name: string;
  examType: CoachingExamType;
  duration: string;
  batchSize: string;
  feePerYear: string;
};

const blankCourse = (): CourseDraft => ({
  id: createId("course"),
  name: "",
  examType: "JEE Mains",
  duration: "",
  batchSize: "",
  feePerYear: "",
});

export default function CoachingRegisterPage() {
  const { pushToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    instituteName: "",
    tagline: "",
    about: "",
    logoUrl: "",
    establishedYear: "",
    phone: "",
    website: "",
    examTypes: [] as CoachingExamType[],
    courses: [blankCourse()],
    facultyCount: "",
    batchSizeMin: "",
    batchSizeMax: "",
    timings: "",
    locality: "",
    fullAddress: "",
    feeRangeMin: "",
    feeRangeMax: "",
    verificationDocumentName: "",
  });

  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  function toggleExamType(value: CoachingExamType) {
    setForm((current) => ({
      ...current,
      examTypes: current.examTypes.includes(value)
        ? current.examTypes.filter((item) => item !== value)
        : [...current.examTypes, value],
    }));
  }

  function updateCourse(id: string, patch: Partial<CourseDraft>) {
    setForm((current) => ({
      ...current,
      courses: current.courses.map((course) => (course.id === id ? { ...course, ...patch } : course)),
    }));
  }

  function addCourse() {
    setForm((current) => ({ ...current, courses: [...current.courses, blankCourse()] }));
  }

  function removeCourse(id: string) {
    setForm((current) => ({
      ...current,
      courses: current.courses.length === 1 ? current.courses : current.courses.filter((course) => course.id !== id),
    }));
  }

  function handleLogoUpload(file: File | null) {
    if (!file) {
      setForm((current) => ({ ...current, logoUrl: "" }));
      return;
    }

    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
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

  function handleDocumentUpload(file: File | null) {
    if (!file) {
      setForm((current) => ({ ...current, verificationDocumentName: "" }));
      return;
    }

    if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
      pushToast({ tone: "error", title: "Upload PDF, JPG, PNG, or WebP for verification" });
      return;
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      pushToast({ tone: "error", title: "Verification document must be 5MB or less" });
      return;
    }

    setForm((current) => ({ ...current, verificationDocumentName: file.name }));
  }

  function validateStep1() {
    const errors: Record<string, string> = {};
    const nameError = validateInstituteName(form.instituteName);
    if (nameError) errors.instituteName = nameError;

    const taglineError = validateTagline(form.tagline);
    if (taglineError) errors.tagline = taglineError;

    const aboutError = validateAbout(form.about);
    if (aboutError) errors.about = aboutError;

    if (!form.logoUrl) errors.logoUrl = "Institute logo is required";

    const yearResult = parseEstablishedYear(form.establishedYear);
    if (yearResult.error) errors.establishedYear = yearResult.error;

    const phoneResult = validateIndianPhone(form.phone);
    if (phoneResult.error) errors.phone = phoneResult.error;

    const websiteError = validateWebsite(form.website);
    if (websiteError) errors.website = websiteError;

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep2() {
    const errors: Record<string, string> = {};
    const examError = validateExamTypes(form.examTypes);
    if (examError) errors.examTypes = examError;

    const hasInvalidCourse = form.courses.some((course) => {
      const batchSize = parsePositiveInt(course.batchSize, 1, 200);
      const feePerYear = parsePositiveInt(course.feePerYear, 1000, 500000);
      return !course.name.trim() || !course.duration.trim() || !batchSize || !feePerYear;
    });

    if (hasInvalidCourse) {
      errors.courses = "Each course requires name, duration, batch size, and annual fee";
    }

    const facultyCount = parsePositiveInt(form.facultyCount, 1, 1000);
    if (!facultyCount) errors.facultyCount = "Faculty count must be between 1 and 1000";

    const minBatch = parsePositiveInt(form.batchSizeMin, 1, 300);
    const maxBatch = parsePositiveInt(form.batchSizeMax, 1, 300);

    if (!minBatch || !maxBatch) {
      errors.batchSize = "Batch size min/max are required";
    } else if (minBatch > maxBatch) {
      errors.batchSize = "Batch size minimum cannot exceed maximum";
    }

    if (!form.timings.trim()) errors.timings = "Timings are required";

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep3() {
    const errors: Record<string, string> = {};

    if (!form.locality) errors.locality = "Select a locality";
    if (!form.fullAddress.trim()) errors.fullAddress = "Full address is required";

    const feeMin = parsePositiveInt(form.feeRangeMin, 1000, 500000);
    const feeMax = parsePositiveInt(form.feeRangeMax, 1000, 500000);

    if (!feeMin || !feeMax) {
      errors.feeRange = "Fee range min/max are required";
    } else if (feeMin > feeMax) {
      errors.feeRange = "Fee range minimum cannot exceed maximum";
    }

    if (!form.verificationDocumentName) {
      errors.verificationDocumentName = "Upload at least one verification document";
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
      pushToast({ tone: "error", title: "Fix validation errors before submitting" });
      return;
    }

    const establishedYear = parseEstablishedYear(form.establishedYear).value;
    const phone = validateIndianPhone(form.phone).value;
    const facultyCount = parsePositiveInt(form.facultyCount, 1, 1000);
    const batchSizeMin = parsePositiveInt(form.batchSizeMin, 1, 300);
    const batchSizeMax = parsePositiveInt(form.batchSizeMax, 1, 300);
    const feeRangeMin = parsePositiveInt(form.feeRangeMin, 1000, 500000);
    const feeRangeMax = parsePositiveInt(form.feeRangeMax, 1000, 500000);

    if (!establishedYear || !phone || !facultyCount || !batchSizeMin || !batchSizeMax || !feeRangeMin || !feeRangeMax) {
      pushToast({ tone: "error", title: "Unexpected validation failure" });
      return;
    }

    const normalizedCourses: CoachingCourse[] = form.courses
      .map((course) => {
        const batchSize = parsePositiveInt(course.batchSize, 1, 200);
        const feePerYear = parsePositiveInt(course.feePerYear, 1000, 500000);
        if (!batchSize || !feePerYear || !isCoachingExamType(course.examType)) {
          return null;
        }

        return {
          id: course.id,
          name: course.name.trim(),
          examType: course.examType,
          duration: course.duration.trim(),
          batchSize,
          feePerYear,
        };
      })
      .filter((course): course is CoachingCourse => Boolean(course));

    if (!normalizedCourses.length) {
      pushToast({ tone: "error", title: "At least one valid course is required" });
      return;
    }

    createCoachingInstituteRegistration({
      name: form.instituteName.trim(),
      tagline: form.tagline.trim(),
      about: form.about.trim(),
      logoUrl: form.logoUrl,
      establishedYear,
      phone,
      website: normalizeWebsite(form.website),
      examTypes: form.examTypes,
      courses: normalizedCourses,
      facultyCount,
      batchSizeMin,
      batchSizeMax,
      timings: form.timings.trim(),
      locality: form.locality,
      fullAddress: form.fullAddress.trim(),
      feeRangeMin,
      feeRangeMax,
      verificationDocumentName: form.verificationDocumentName,
      highlights: ["Pending Verification"],
    });

    setSubmitted(true);
    pushToast({
      tone: "success",
      title: "Registration submitted",
      description: "Status set to pending and admin has been notified.",
    });
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-light)] text-xl font-semibold text-[var(--green)]">Done</div>
          <h1 className="mt-6 font-display text-4xl font-bold text-[var(--foreground)]">Institute submitted for review</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Status is pending. Our admin team has been notified and will verify your details.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/coaching/dashboard" className="btn-primary px-6 py-3 text-sm">Go to dashboard</Link>
            <Link href="/coaching" className="btn-secondary px-6 py-3 text-sm">Browse Coaching</Link>
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
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Coaching institute onboarding</p>
            <h1 className="mt-2 font-display text-4xl font-bold text-[var(--foreground)]">Register your institute</h1>
          </div>
          <span className="pill pill-active">Step {currentStep + 1} of 3</span>
        </div>

        <div className="mt-6 h-3 rounded-full bg-[var(--surface-alt)]">
          <div className="h-full rounded-full bg-[#1E40AF] transition-all" style={{ width: `${progress}%` }} />
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
                <label className="block rounded-[1.5rem] border border-dashed border-[var(--border)] bg-[rgba(239,246,255,0.65)] p-6 text-center">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)} />
                  <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-lg font-semibold text-[#1E40AF]">
                    {form.logoUrl ? <img src={form.logoUrl} alt="Institute logo" className="h-full w-full object-cover" /> : "Logo"}
                  </div>
                  <span className="btn-secondary px-4 py-2 text-sm">Upload logo</span>
                </label>
                <p className="text-sm text-[var(--muted)]">JPG, PNG, or WebP only. Max size 2MB.</p>
                {step1Errors.logoUrl ? <p className="text-sm text-red-600">{step1Errors.logoUrl}</p> : null}
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Institute name</label>
                  <input className="field" value={form.instituteName} onChange={(event) => setForm((current) => ({ ...current, instituteName: event.target.value }))} />
                  {step1Errors.instituteName ? <p className="mt-2 text-sm text-red-600">{step1Errors.instituteName}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Tagline</label>
                  <input className="field" maxLength={100} value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} />
                  <p className="mt-2 text-xs text-[var(--muted)]">{form.tagline.length}/100</p>
                  {step1Errors.tagline ? <p className="mt-2 text-sm text-red-600">{step1Errors.tagline}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">About</label>
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
                    <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Phone number</label>
                    <input className="field" inputMode="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
                    {step1Errors.phone ? <p className="mt-2 text-sm text-red-600">{step1Errors.phone}</p> : null}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Website (optional)</label>
                  <input className="field" value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
                  {step1Errors.website ? <p className="mt-2 text-sm text-red-600">{step1Errors.website}</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {currentStep === 1 ? (
            <section className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-[var(--foreground)]">Exam types</p>
                <div className="flex flex-wrap gap-2">
                  {coachingExamTypes.map((exam) => (
                    <button key={exam} type="button" onClick={() => toggleExamType(exam)} className={`pill ${form.examTypes.includes(exam) ? "pill-active" : "pill-inactive"}`}>{exam}</button>
                  ))}
                </div>
                {step2Errors.examTypes ? <p className="mt-2 text-sm text-red-600">{step2Errors.examTypes}</p> : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Courses offered</p>
                  <button type="button" onClick={addCourse} className="btn-secondary px-4 py-2 text-xs">Add Course</button>
                </div>

                {form.courses.map((course) => (
                  <article key={course.id} className="rounded-xl border border-[var(--border)] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className="field" placeholder="Course name" value={course.name} onChange={(event) => updateCourse(course.id, { name: event.target.value })} />
                      <select className="select" value={course.examType} onChange={(event) => updateCourse(course.id, { examType: event.target.value as CoachingExamType })}>
                        {coachingExamTypes.map((exam) => <option key={exam} value={exam}>{exam}</option>)}
                      </select>
                      <input className="field" placeholder="Duration (e.g. 2 Years)" value={course.duration} onChange={(event) => updateCourse(course.id, { duration: event.target.value })} />
                      <input className="field" placeholder="Batch size" value={course.batchSize} onChange={(event) => updateCourse(course.id, { batchSize: event.target.value.replace(/[^0-9]/g, "") })} />
                      <input className="field md:col-span-2" placeholder="Fee per year (₹)" value={course.feePerYear} onChange={(event) => updateCourse(course.id, { feePerYear: event.target.value.replace(/[^0-9]/g, "") })} />
                    </div>
                    <button type="button" onClick={() => removeCourse(course.id)} className="mt-3 text-xs font-medium text-red-600">Remove course</button>
                  </article>
                ))}

                {step2Errors.courses ? <p className="text-sm text-red-600">{step2Errors.courses}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Faculty count</label>
                  <input className="field" value={form.facultyCount} onChange={(event) => setForm((current) => ({ ...current, facultyCount: event.target.value.replace(/[^0-9]/g, "") }))} />
                  {step2Errors.facultyCount ? <p className="mt-2 text-sm text-red-600">{step2Errors.facultyCount}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Timings</label>
                  <input className="field" placeholder="Mon-Sat, 6AM-8PM" value={form.timings} onChange={(event) => setForm((current) => ({ ...current, timings: event.target.value }))} />
                  {step2Errors.timings ? <p className="mt-2 text-sm text-red-600">{step2Errors.timings}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input className="field" placeholder="Batch size min" value={form.batchSizeMin} onChange={(event) => setForm((current) => ({ ...current, batchSizeMin: event.target.value.replace(/[^0-9]/g, "") }))} />
                <input className="field" placeholder="Batch size max" value={form.batchSizeMax} onChange={(event) => setForm((current) => ({ ...current, batchSizeMax: event.target.value.replace(/[^0-9]/g, "") }))} />
              </div>
              {step2Errors.batchSize ? <p className="text-sm text-red-600">{step2Errors.batchSize}</p> : null}
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

              <div className="grid grid-cols-2 gap-3">
                <input className="field" placeholder="Fee min (₹/yr)" value={form.feeRangeMin} onChange={(event) => setForm((current) => ({ ...current, feeRangeMin: event.target.value.replace(/[^0-9]/g, "") }))} />
                <input className="field" placeholder="Fee max (₹/yr)" value={form.feeRangeMax} onChange={(event) => setForm((current) => ({ ...current, feeRangeMax: event.target.value.replace(/[^0-9]/g, "") }))} />
                {step3Errors.feeRange ? <p className="col-span-2 text-sm text-red-600">{step3Errors.feeRange}</p> : null}
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Full address</label>
                <textarea className="textarea" value={form.fullAddress} onChange={(event) => setForm((current) => ({ ...current, fullAddress: event.target.value }))} />
                {step3Errors.fullAddress ? <p className="mt-2 text-sm text-red-600">{step3Errors.fullAddress}</p> : null}
              </div>

              <div className="lg:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--ivory)] p-4">
                <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Verification document upload</label>
                <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => handleDocumentUpload(event.target.files?.[0] ?? null)} />
                <p className="mt-2 text-xs text-[var(--muted)]">Accepted: registration certificate, board affiliation, or equivalent. Max size 5MB.</p>
                {form.verificationDocumentName ? <p className="mt-2 text-sm text-[var(--navy)]">Selected: {form.verificationDocumentName}</p> : null}
                {step3Errors.verificationDocumentName ? <p className="mt-2 text-sm text-red-600">{step3Errors.verificationDocumentName}</p> : null}
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
        Need help before applying? Visit <Link href="/coaching" className="font-medium text-[#1E40AF]">coaching browse</Link> to review existing institute profiles.
      </div>
    </div>
  );
}
