"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { clearSession, loadAppState, saveSession, updateProfile } from "@/lib/mock-db";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleSetupSubmitting, setIsGoogleSetupSubmitting] = useState(false);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [googleName, setGoogleName] = useState("");
  const [googlePassword, setGooglePassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const roleParam = searchParams.get("role");
  const preferredRole: "teacher" | "parent" | null = roleParam === "teacher" || roleParam === "parent" ? roleParam : null;
  const [selectedRole, setSelectedRole] = useState<"teacher" | "parent">(preferredRole ?? "parent");
  const returnTo = searchParams.get("next");

  useEffect(() => {
    const oauthEmail = searchParams.get("email");
    const oauthName = searchParams.get("name");
    const oauthProvider = searchParams.get("oauth");
    const oauthError = searchParams.get("oauthError");

    if (oauthEmail) {
      setEmail(oauthEmail);
    }

    if (oauthName) {
      setName(oauthName);
    }

    if (oauthEmail) {
      setAcceptedTerms(true);
    }

    if (oauthProvider === "google") {
      setGoogleName(oauthName ?? "");
      setShowGoogleSetupModal(true);
    }

    if (oauthError) {
      pushToast({ tone: "error", title: "Google login failed. Please try again." });
    }
  }, [searchParams, pushToast]);

  function resolvePostLoginRoute(role?: "teacher" | "parent") {
    if (returnTo && returnTo.startsWith("/")) {
      return returnTo;
    }

    if (role === "teacher") {
      return "/teacher/dashboard";
    }

    if (role === "parent") {
      return "/browse";
    }

    return "/onboarding";
  }

  useEffect(() => {
    const snapshot = loadAppState();
    setHasSession(Boolean(snapshot.session));
    setLoaded(true);
  }, []);

  function continueSession() {
    const snapshot = loadAppState();
    const role = snapshot.session?.role;

    if (!snapshot.session) {
      setHasSession(false);
      return;
    }

    router.push(resolvePostLoginRoute(role));
  }

  function signOutCurrentSession() {
    clearSession();
    setHasSession(false);
    pushToast({ tone: "success", title: "Signed out" });
  }

  async function continueWithGoogle() {
    const client = getSupabaseBrowserClient();
    if (!client) {
      pushToast({ tone: "error", title: "Supabase is not configured for Google login." });
      return;
    }

    setIsGoogleLoading(true);
    const callbackParams = new URLSearchParams();
    if (selectedRole) {
      callbackParams.set("role", selectedRole);
    }
    if (returnTo && returnTo.startsWith("/")) {
      callbackParams.set("next", returnTo);
    }

    const redirectTo = `${window.location.origin}/auth/callback?${callbackParams.toString()}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) {
      setIsGoogleLoading(false);
      pushToast({ tone: "error", title: error.message || "Google login failed." });
    }
  }

  async function completeGoogleSetup() {
    const client = getSupabaseBrowserClient();
    if (!client) {
      pushToast({ tone: "error", title: "Supabase is not configured for Google login." });
      return;
    }

    const trimmedName = googleName.trim();
    if (trimmedName.length < 2) {
      pushToast({ tone: "error", title: "Please enter your full name." });
      return;
    }

    if (googlePassword.length < 8) {
      pushToast({ tone: "error", title: "Password must be at least 8 characters." });
      return;
    }

    setIsGoogleSetupSubmitting(true);

    const userResult = await client.auth.getUser();
    const user = userResult.data.user;
    if (userResult.error || !user?.email) {
      setIsGoogleSetupSubmitting(false);
      pushToast({ tone: "error", title: "Unable to read Google account details." });
      return;
    }

    const passwordUpdate = await client.auth.updateUser({ password: googlePassword });
    if (passwordUpdate.error) {
      setIsGoogleSetupSubmitting(false);
      pushToast({ tone: "error", title: passwordUpdate.error.message || "Unable to set password." });
      return;
    }

    const syntheticPhone = `oauth-${user.id.replace(/-/g, "").slice(0, 12)}`;
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        name: trimmedName,
        phone: syntheticPhone,
        role: selectedRole,
        acceptedTerms: true,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; userId?: string };
    if (!response.ok || !payload.userId) {
      setIsGoogleSetupSubmitting(false);
      pushToast({ tone: "error", title: payload.message ?? "Google account setup failed." });
      return;
    }

    saveSession({
      id: payload.userId,
      phone: syntheticPhone,
      name: trimmedName,
      email: user.email,
      role: selectedRole,
    });

    updateProfile({
      id: payload.userId,
      role: selectedRole,
      name: trimmedName,
      phone: syntheticPhone,
      email: user.email,
      created_at: new Date().toISOString(),
    });

    setIsGoogleSetupSubmitting(false);
    setShowGoogleSetupModal(false);
    pushToast({ tone: "success", title: "Google account connected", description: "Your account is ready." });

    router.push(
      selectedRole === "teacher"
        ? (returnTo && returnTo.startsWith("/") ? returnTo : "/teacher/setup")
        : resolvePostLoginRoute("parent"),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!acceptedTerms) {
      pushToast({ tone: "error", title: "Please accept Terms and Privacy to continue." });
      return;
    }

    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        role: selectedRole,
        acceptedTerms,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { message?: string; userId?: string };
    if (!response.ok || !payload.userId) {
      pushToast({ tone: "error", title: payload.message ?? "Account creation failed." });
      return;
    }

    saveSession({
      id: payload.userId,
      phone: phone.trim(),
      name: name.trim(),
      email: email.trim(),
      role: selectedRole,
    });

    updateProfile({
      id: payload.userId,
      role: selectedRole,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      created_at: new Date().toISOString(),
    });

    pushToast({ tone: "success", title: "Signed in", description: selectedRole === "teacher" ? "Continue to teacher profile setup." : "You can now contact and review teachers." });
    router.push(selectedRole === "teacher" ? (returnTo && returnTo.startsWith("/") ? returnTo : "/teacher/setup") : resolvePostLoginRoute("parent"));
  }

  if (!loaded) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading login...</div>;
  }

  return (
    <div className="page-section">
      <span className="page-label">Login / Sign Up</span>
      <div className="auth-page">
        <div className="auth-left">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-lg bg-white/85 p-2">
              <Image src="/docent-mark-v2.png?v=5" alt="Docent logo" width={22} height={22} priority className="h-[22px] w-[22px]" />
            </div>
            <div className="font-mono text-[15px] tracking-[0.06em] text-white">Docent</div>
          </div>
          <h2 className="auth-headline">The best tutors in<br />Mathura are on<br /><em>Docent.</em></h2>
          <div className="auth-benefits">
            <div className="auth-benefit"><div className="auth-benefit-dot" />Verified tutors only</div>
            <div className="auth-benefit"><div className="auth-benefit-dot" />Filter by locality</div>
            <div className="auth-benefit"><div className="auth-benefit-dot" />Review before contacting</div>
            <div className="auth-benefit"><div className="auth-benefit-dot" />Direct WhatsApp contact</div>
          </div>
        </div>

        <div className="auth-right">
          <h2 className="auth-form-title">Create your account</h2>
          <p className="auth-form-sub">Free to join. Takes less than 2 minutes.</p>

          {hasSession ? (
            <div className="mb-5 rounded-xl bg-[var(--ivory2)] p-3 text-sm text-[var(--navy)]">
              <p>You already have an active session in this browser.</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={continueSession} className="btn-primary px-4 py-2 text-xs">Continue</button>
                <button type="button" onClick={signOutCurrentSession} className="btn-secondary px-4 py-2 text-xs">Sign out</button>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={isGoogleLoading}
            className="btn-secondary mb-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] bg-white text-xs font-bold">G</span>
            {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
          </button>

          <form onSubmit={handleSubmit}>
            <div className="role-toggle">
              <button type="button" className={`role-btn ${selectedRole === "parent" ? "active" : ""}`} onClick={() => setSelectedRole("parent")}>👨‍👩‍👧 I&apos;m a Parent</button>
              <button type="button" className={`role-btn ${selectedRole === "teacher" ? "active" : ""}`} onClick={() => setSelectedRole("teacher")}>👨‍🏫 I&apos;m a Teacher</button>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Sunita Sharma" required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98xxxxxx" required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@email.com" required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Min. 8 characters" required />
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-[var(--navy)]"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                I agree to the <Link href="/company/legal/terms" className="underline decoration-[var(--border2)] underline-offset-2 hover:text-[var(--navy)]">Terms and Conditions</Link> and <Link href="/company/legal/privacy" className="underline decoration-[var(--border2)] underline-offset-2 hover:text-[var(--navy)]">Privacy Policy</Link>.
              </span>
            </label>

            <button type="submit" className="btn-primary mt-3 w-full rounded-xl py-3 text-sm" disabled={!acceptedTerms}>Create Account</button>
          </form>
        </div>
      </div>

      {showGoogleSetupModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="card-surface w-full max-w-md rounded-[1.5rem] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Google Sign-In</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-[var(--foreground)]">Complete your account</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Set your display name and password to finish account creation.</p>

            <div className="mt-5 space-y-4">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={googleName}
                  onChange={(event) => setGoogleName(event.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={googlePassword}
                  onChange={(event) => setGooglePassword(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="btn-secondary w-full px-4 py-3 text-sm"
                onClick={() => setShowGoogleSetupModal(false)}
                disabled={isGoogleSetupSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary w-full px-4 py-3 text-sm"
                onClick={completeGoogleSetup}
                disabled={isGoogleSetupSubmitting}
              >
                {isGoogleSetupSubmitting ? "Saving..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
