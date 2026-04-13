"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TeacherCard } from "@/components/teacher-card";
import { useToast } from "@/components/toast-provider";
import { loadAppState } from "@/lib/mock-db";

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const snapshot = loadAppState();
    if (!snapshot.session) {
      router.replace("/auth");
      return;
    }

    if (snapshot.session.role !== "teacher") {
      router.replace("/browse");
      return;
    }

    setMounted(true);
  }, [router]);

  if (!mounted) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading dashboard...</div>;
  }

  const snapshot = loadAppState();
  const session = snapshot.session!;
  const teacher = snapshot.teachers.find((item) => item.user_id === session.id || item.name === session.name);

  if (!teacher) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="card-surface w-full rounded-[2rem] p-10 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--foreground)]">No teacher profile yet</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">Create your teaching profile to start appearing in search results.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/teacher/setup" className="btn-primary px-6 py-3 text-sm">Create profile</Link>
            <Link href="/browse" className="btn-secondary px-6 py-3 text-sm">Browse Experts</Link>
          </div>
        </div>
      </div>
    );
  }

  const currentTeacher = teacher;

  function copyProfileLink() {
    navigator.clipboard.writeText(`${window.location.origin}/teacher/${currentTeacher.id}`);
    pushToast({ tone: "success", title: "Profile link copied" });
  }

  const statusTone = currentTeacher.status === "verified" ? "badge-verified" : currentTeacher.status === "pending" ? "badge-pending" : "badge-pending";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-20">
      <section className="card-surface rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Teacher dashboard</p>
            <h1 className="mt-3 font-display text-4xl font-bold text-[var(--foreground)]">Welcome back, {session.name}</h1>
            <p className="mt-3 max-w-2xl text-lg leading-8 text-[var(--muted)]">Track your profile status, review your public card, and copy the share link for parents.</p>
          </div>
          <span className={`pill ${statusTone}`}>{teacher.status}</span>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <TeacherCard teacher={currentTeacher} />
          <div className="space-y-4">
            <div className="card-soft rounded-[1.75rem] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Status</p>
              <p className="mt-2 font-display text-2xl font-bold text-[var(--foreground)] capitalize">{teacher.status}</p>
              {teacher.is_resubmission ? (
                <p className="mt-2 inline-flex w-fit rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]">
                  Re-submission
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {currentTeacher.status === "pending"
                  ? "Your profile is awaiting approval. The admin can verify or reject it from the admin panel."
                  : "Your profile is live and can be discovered by parents in Mathura."}
              </p>
            </div>
            <div className="card-soft rounded-[1.75rem] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Quick actions</p>
              <div className="mt-4 flex flex-col gap-3">
                <button type="button" onClick={copyProfileLink} className="btn-primary px-5 py-3 text-sm">Copy profile link</button>
                <Link href="/teacher/setup?edit=1" className="btn-secondary px-5 py-3 text-sm">Edit profile</Link>
                <Link href={`/teacher/${teacher.id}`} className="btn-ghost px-5 py-3 text-sm">View public profile</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
