"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { getProfilesByPhone, loadAppState, saveSession, updateProfile } from "@/lib/mock-db";

export default function OnboardingPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const snapshot = loadAppState();
    if (!snapshot.session) {
      router.replace("/auth");
      return;
    }

    if (snapshot.session.role === "teacher") {
      router.replace("/teacher/dashboard");
      return;
    }

    if (snapshot.session.role === "parent") {
      router.replace("/browse");
      return;
    }

    setLoaded(true);
  }, [router]);

  async function chooseRole(role: "teacher" | "parent") {
    const snapshot = loadAppState();
    if (!snapshot.session) {
      router.push("/auth");
      return;
    }

    if (!snapshot.session.email || !snapshot.session.name || !snapshot.session.phone) {
      pushToast({ tone: "error", title: "Missing session details." });
      return;
    }

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: snapshot.session.email,
        name: snapshot.session.name,
        phone: snapshot.session.phone,
        role,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; userId?: string };

    if (!response.ok || !payload.userId) {
      pushToast({ tone: "error", title: payload.message ?? "Profile save failed." });
      return;
    }


    const conflictingPhoneProfile = getProfilesByPhone(snapshot.session.phone).find(
      (profile) => profile.id !== snapshot.session?.id && profile.role !== role,
    );

    if (conflictingPhoneProfile) {
      pushToast({
        tone: "error",
        title: "This number is already registered. Please login instead.",
      });
      return;
    }

    const session = { ...snapshot.session, id: payload.userId, role };
    saveSession(session);
    updateProfile({
      id: session.id,
      role,
      name: session.name,
      phone: session.phone,
      email: session.email,
      created_at: new Date().toISOString(),
    });

    pushToast({
      tone: "success",
      title: role === "teacher" ? "Teacher role saved" : "Parent role saved",
      description: role === "teacher" ? "Let's build your profile next." : "You can start browsing tutors now.",
    });

    router.push(role === "teacher" ? "/teacher/setup" : "/browse");
  }

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--saffron)] animate-bounce"></div>
          <div className="h-2 w-2 rounded-full bg-[var(--saffron)] animate-bounce delay-100"></div>
          <div className="h-2 w-2 rounded-full bg-[var(--saffron)] animate-bounce delay-200"></div>
        </div>
        <p className="mt-3 text-[var(--muted)]">Setting up your account...</p>
      </div>
    );
  }

  const snapshot = loadAppState();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy)]/2 to-[var(--navy)]/5 px-4 py-10 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-4xl">
        <div className="rounded-3xl bg-white border border-[var(--border)] shadow-lg p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted2)] font-semibold">Select Your Path</p>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-light text-[var(--navy)] leading-tight">How would you like to use Docent?</h1>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">Choose your role to personalize your experience and get started immediately.</p>
          
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--ivory2)] p-4">
            <p className="text-sm text-[var(--muted)]">Signed in as <span className="font-semibold text-[var(--navy)]">{snapshot.session?.name}</span> · <span className="font-mono text-[var(--muted2)]">{snapshot.session?.phone}</span></p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => chooseRole("parent")}
              className="group rounded-2xl border-2 border-[var(--border)] bg-white p-8 text-left transition-all hover:border-[var(--saffron)] hover:shadow-md hover:bg-gradient-to-br hover:from-[var(--saffron-light)] hover:to-white"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--saffron-light)] text-[var(--saffron)] font-display text-xl group-hover:bg-[var(--saffron)] group-hover:text-white transition">✓</div>
              </div>
              <h2 className="mt-5 font-display text-2xl font-light text-[var(--navy)]">Find Quality Education</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Browse verified tutors, compare coaching centers, and explore top schools in your area with detailed information and ratings.
              </p>
              <div className="mt-5 flex items-center text-xs font-semibold text-[var(--saffron)]">
                Get Started →
              </div>
            </button>

            <button
              type="button"
              onClick={() => chooseRole("teacher")}
              className="group rounded-2xl border-2 border-[var(--border)] bg-white p-8 text-left transition-all hover:border-[var(--saffron)] hover:shadow-md hover:bg-gradient-to-br hover:from-[var(--saffron-light)] hover:to-white"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--saffron-light)] text-[var(--saffron)] font-display text-xl group-hover:bg-[var(--saffron)] group-hover:text-white transition">✓</div>
              </div>
              <h2 className="mt-5 font-display text-2xl font-light text-[var(--navy)]">Grow Your Education Business</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Build your professional profile and get discovered by parents and students actively looking for qualified educators.
              </p>
              <div className="mt-5 flex items-center text-xs font-semibold text-[var(--saffron)]">
                Create Profile →
              </div>
            </button>
          </div>

          <div className="mt-10 border-t border-[var(--border)] pt-8">
            <p className="text-xs text-[var(--muted2)]">
              <span className="font-semibold text-[var(--navy)]">Privacy First:</span> Your data is secure and encrypted. We never sell your information or spam your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
