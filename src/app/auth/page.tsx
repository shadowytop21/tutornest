"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { clearSession, loadAppState, saveSession, updateProfile } from "@/lib/mock-db";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import "./auth.css";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [activeTab, setActiveTab] = useState<"signup" | "login">("signup");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const roleParam = searchParams.get("role");
  const preferredRole: "teacher" | "parent" | null = roleParam === "teacher" || roleParam === "parent" ? roleParam : null;
  const [selectedRole, setSelectedRole] = useState<"teacher" | "parent">(preferredRole ?? "parent");
  const returnTo = searchParams.get("next");

  useEffect(() => {
    const oauthEmail = searchParams.get("email");
    const oauthName = searchParams.get("name");
    const oauthError = searchParams.get("oauthError");
    const redirectRole = searchParams.get("role");

    if (oauthEmail) setEmail(oauthEmail);
    if (oauthName) setName(oauthName);
    if (oauthEmail) { setAcceptedTerms(true); setTermsChecked(true); }
    if (redirectRole === "teacher" || redirectRole === "parent") setSelectedRole(redirectRole);
    if (oauthError) pushToast({ tone: "error", title: "Google login failed. Please try again." });
  }, [searchParams, pushToast]);

  useEffect(() => {
    let active = true;
    async function hydrateGoogleSetupFromSupabaseSession() {
      const snapshot = loadAppState();
      if (snapshot.session) return;
      const client = getSupabaseBrowserClient();
      if (!client) return;
      const userResult = await client.auth.getUser();
      const user = userResult.data.user;
      if (!active || userResult.error || !user?.email) return;
      const roleParam = searchParams.get("role");
      if (roleParam === "teacher" || roleParam === "parent") setSelectedRole(roleParam);
      const inferredName = (user.user_metadata?.full_name as string | undefined) || (user.user_metadata?.name as string | undefined) || "";
      setEmail(user.email);
      setName(inferredName);
      setAcceptedTerms(true);
      setTermsChecked(true);
    }
    hydrateGoogleSetupFromSupabaseSession();
    return () => { active = false; };
  }, [searchParams]);

  function resolvePostLoginRoute(role?: "teacher" | "parent") {
    if (returnTo && returnTo.startsWith("/")) return returnTo;
    if (role === "teacher") return "/teacher/dashboard";
    if (role === "parent") return "/browse";
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
    if (!snapshot.session) { setHasSession(false); return; }
    router.push(resolvePostLoginRoute(role));
  }

  function signOutCurrentSession() {
    clearSession();
    setHasSession(false);
    pushToast({ tone: "success", title: "Signed out" });
  }

  function selectRole(role: "teacher" | "parent") {
    setSelectedRole(role);
  }

  function toggleTerms() {
    const next = !termsChecked;
    setTermsChecked(next);
    setAcceptedTerms(next);
  }

  async function continueWithGoogle() {
    const client = getSupabaseBrowserClient();
    if (!client) {
      pushToast({ tone: "error", title: "Supabase is not configured for Google login." });
      return;
    }
    setIsGoogleLoading(true);
    const callbackParams = new URLSearchParams();
    if (selectedRole) callbackParams.set("role", selectedRole);
    if (returnTo && returnTo.startsWith("/")) callbackParams.set("next", returnTo);
    const redirectTo = `${window.location.origin}/auth/callback?${callbackParams.toString()}`;
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: false },
    });
    if (error) {
      setIsGoogleLoading(false);
      pushToast({ tone: "error", title: error.message || "Google login failed." });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedTerms) {
      pushToast({ tone: "error", title: "Please accept Terms and Privacy to continue." });
      return;
    }
    const response = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), name: name.trim(), phone: phone.trim(), role: selectedRole, acceptedTerms }),
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string; userId?: string };
    if (!response.ok || !payload.userId) {
      pushToast({ tone: "error", title: payload.message ?? "Account creation failed." });
      return;
    }
    saveSession({ id: payload.userId, phone: phone.trim(), name: name.trim(), email: email.trim(), role: selectedRole });
    updateProfile({ id: payload.userId, role: selectedRole, name: name.trim(), phone: phone.trim(), email: email.trim(), created_at: new Date().toISOString() });
    pushToast({ tone: "success", title: "Signed in", description: selectedRole === "teacher" ? "Continue to teacher profile setup." : "You can now contact and review teachers." });
    router.push(selectedRole === "teacher" ? (returnTo && returnTo.startsWith("/") ? returnTo : "/teacher/setup") : resolvePostLoginRoute("parent"));
  }

  if (!loaded) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading...</div>;
  }

  return (
    <div className="docent-auth-wrapper">
      {/* ── LEFT PANEL ── */}
      <div className="docent-left-panel">
        <div className="docent-geo-ring-1" />
        <div className="docent-geo-ring-2" />
        <div className="docent-glow-blob" />

        {/* Logo */}
        <div className="docent-left-logo">
          <div className="docent-left-logo-mark">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm-1.5 13V8l7 4-7 4z" />
            </svg>
          </div>
          <span className="docent-left-logo-text">Docent</span>
        </div>

        {/* Main content */}
        <div className="docent-left-content">
          <div className="docent-left-eyebrow">
            <div className="docent-eyebrow-dot" />
            <span className="docent-eyebrow-text">Mathura&apos;s Tuition Platform</span>
          </div>
          <h2 className="docent-left-headline">
            The best tutors<br />
            in Mathura are<br />
            <em>waiting for you.</em>
          </h2>
          <div className="docent-floating-cards">
            <div className="docent-float-card">
              <div className="docent-fcard-avatar a1">PS</div>
              <div className="docent-fcard-info">
                <div className="docent-fcard-name">Priya Sharma</div>
                <div className="docent-fcard-detail">Maths · Physics · Civil Lines</div>
              </div>
              <div className="docent-fcard-right">
                <div className="docent-fcard-badge">✓ Verified</div>
                <div className="docent-fcard-price">₹1,200/mo</div>
              </div>
            </div>
            <div className="docent-float-card">
              <div className="docent-fcard-avatar a2">RM</div>
              <div className="docent-fcard-info">
                <div className="docent-fcard-name">Rahul Mehta</div>
                <div className="docent-fcard-detail">Chemistry · Biology · Vrindavan</div>
              </div>
              <div className="docent-fcard-right">
                <div className="docent-fcard-badge">✓ Verified</div>
                <div className="docent-fcard-price">₹1,500/mo</div>
              </div>
            </div>
            <div className="docent-float-card">
              <div className="docent-fcard-avatar a3">AV</div>
              <div className="docent-fcard-info">
                <div className="docent-fcard-name">Anjali Verma</div>
                <div className="docent-fcard-detail">English · Hindi · Krishna Nagar</div>
              </div>
              <div className="docent-fcard-right">
                <div className="docent-fcard-badge">✓ Verified</div>
                <div className="docent-fcard-price">₹800/mo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="docent-left-stats">
          <div>
            <div className="docent-lstat-num">124+</div>
            <div className="docent-lstat-label">Verified Tutors</div>
          </div>
          <div>
            <div className="docent-lstat-num">340+</div>
            <div className="docent-lstat-label">Happy Families</div>
          </div>
          <div>
            <div className="docent-lstat-num">4.9★</div>
            <div className="docent-lstat-label">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="docent-right-panel">
        <div className="docent-right-panel-bg" />

        {/* Top bar */}
        <div className="docent-right-top">
          <Link href="/" className="docent-back-link">← Back to Docent</Link>
          <div className="docent-right-top-text">
            {activeTab === "signup"
              ? <span>Already have an account? <button type="button" onClick={() => setActiveTab("login")} className="docent-link-btn">Login</button></span>
              : <span>New to Docent? <button type="button" onClick={() => setActiveTab("signup")} className="docent-link-btn">Create Account</button></span>
            }
          </div>
        </div>

        {/* Form area */}
        <div className="docent-form-area">

          {/* Existing session banner */}
          {hasSession && (
            <div className="docent-session-banner">
              <p>You already have an active session in this browser.</p>
              <div className="docent-session-btns">
                <button type="button" onClick={continueSession} className="docent-btn-submit" style={{ padding: "10px 20px", fontSize: "13px" }}>
                  <span>Continue</span>
                </button>
                <button type="button" onClick={signOutCurrentSession} className="docent-btn-outline">Sign out</button>
              </div>
            </div>
          )}

          {/* Tab switcher */}
          <div className="docent-auth-tabs">
            <button
              type="button"
              className={`docent-auth-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              Create Account
            </button>
            <button
              type="button"
              className={`docent-auth-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Login
            </button>
          </div>

          {/* ─── SIGN UP FORM ─── */}
          {activeTab === "signup" && (
            <>
              <div className="docent-step-indicator">
                <div className="docent-step-dot active" />
                <div className="docent-step-dot" />
                <span className="docent-step-label">Step 1 of 2 — Your Details</span>
              </div>

              <h1 className="docent-form-title">Join Docent</h1>
              <p className="docent-form-subtitle">Free forever for parents. Free to list for teachers.</p>

              {/* Role selector */}
              <div className="docent-role-selector">
                <div
                  className={`docent-role-card ${selectedRole === "parent" ? "active" : ""}`}
                  onClick={() => selectRole("parent")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && selectRole("parent")}
                  aria-pressed={selectedRole === "parent"}
                >
                  <div className="docent-role-check">✓</div>
                  <span className="docent-role-emoji">👨‍👩‍👧</span>
                  <div className="docent-role-title">I&apos;m a Parent</div>
                  <div className="docent-role-desc">Find the perfect tutor for my child</div>
                </div>
                <div
                  className={`docent-role-card ${selectedRole === "teacher" ? "active" : ""}`}
                  onClick={() => selectRole("teacher")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && selectRole("teacher")}
                  aria-pressed={selectedRole === "teacher"}
                >
                  <div className="docent-role-check">✓</div>
                  <span className="docent-role-emoji">👨‍🏫</span>
                  <div className="docent-role-title">I&apos;m a Teacher</div>
                  <div className="docent-role-desc">Create a profile and get discovered</div>
                </div>
              </div>

              {/* Google auth */}
              <button type="button" className="docent-btn-google" onClick={continueWithGoogle} disabled={isGoogleLoading} id="google-signup-btn">
                <svg className="docent-google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>

              {/* OR divider */}
              <div className="docent-or-divider">
                <div className="docent-or-line" />
                <span className="docent-or-text">or</span>
                <div className="docent-or-line" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="docent-form-row">
                  <div className="docent-form-group">
                    <label className="docent-form-label" htmlFor="auth-name">Full Name</label>
                    <div className="docent-form-input-wrap">
                      <span className="docent-form-input-icon">👤</span>
                      <input
                        id="auth-name"
                        className="docent-form-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sunita Sharma"
                        required
                      />
                    </div>
                  </div>
                  <div className="docent-form-group">
                    <label className="docent-form-label" htmlFor="auth-phone">Phone</label>
                    <div className="docent-form-input-wrap">
                      <span className="docent-phone-prefix">+91</span>
                      <input
                        id="auth-phone"
                        className="docent-form-input docent-phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98xxxxxx00"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="docent-form-group">
                  <label className="docent-form-label" htmlFor="auth-email">Email Address</label>
                  <div className="docent-form-input-wrap">
                    <span className="docent-form-input-icon">✉️</span>
                    <input
                      id="auth-email"
                      className="docent-form-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="docent-form-group">
                  <div className="docent-form-label">
                    <label htmlFor="auth-password">Password</label>
                    <span className="docent-form-label-hint">Min. 8 characters</span>
                  </div>
                  <div className="docent-form-input-wrap">
                    <span className="docent-form-input-icon">🔒</span>
                    <input
                      id="auth-password"
                      className="docent-form-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                    <button type="button" className="docent-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                {/* Terms */}
                <div className="docent-terms-row">
                  <div
                    className={`docent-custom-checkbox ${termsChecked ? "checked" : ""}`}
                    onClick={toggleTerms}
                    role="checkbox"
                    aria-checked={termsChecked}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleTerms()}
                  />
                  <p className="docent-terms-text">
                    I agree to the{" "}
                    <Link href="/company/legal/terms">Terms and Conditions</Link>
                    {" "}and{" "}
                    <Link href="/company/legal/privacy">Privacy Policy</Link>.
                  </p>
                </div>

                <button type="submit" className="docent-btn-submit" disabled={!acceptedTerms} id="create-account-btn">
                  <span>Create Account →</span>
                </button>
              </form>

              {/* Trust badges */}
              <div className="docent-trust-row">
                <div className="docent-trust-item"><span className="docent-trust-dot">🔒</span> SSL Secure</div>
                <div className="docent-trust-item"><span className="docent-trust-dot">✓</span> Verified tutors</div>
                <div className="docent-trust-item"><span className="docent-trust-dot">🇮🇳</span> Mathura-local</div>
              </div>
            </>
          )}

          {/* ─── LOGIN FORM ─── */}
          {activeTab === "login" && (
            <>
              <h1 className="docent-form-title">Welcome back</h1>
              <p className="docent-form-subtitle">Sign in to your Docent account.</p>

              <button type="button" className="docent-btn-google" onClick={continueWithGoogle} disabled={isGoogleLoading} id="google-login-btn">
                <svg className="docent-google-icon" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>{isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>

              <div className="docent-or-divider">
                <div className="docent-or-line" />
                <span className="docent-or-text">or</span>
                <div className="docent-or-line" />
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="docent-form-group">
                  <label className="docent-form-label" htmlFor="login-email">Email Address</label>
                  <div className="docent-form-input-wrap">
                    <span className="docent-form-input-icon">✉️</span>
                    <input
                      id="login-email"
                      className="docent-form-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="docent-form-group">
                  <div className="docent-form-label">
                    <label htmlFor="login-password">Password</label>
                  </div>
                  <div className="docent-form-input-wrap">
                    <span className="docent-form-input-icon">🔒</span>
                    <input
                      id="login-password"
                      className="docent-form-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Your password"
                      required
                    />
                    <button type="button" className="docent-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <div className="docent-role-selector" style={{ marginBottom: "1.5rem" }}>
                  <div
                    className={`docent-role-card ${selectedRole === "parent" ? "active" : ""}`}
                    onClick={() => selectRole("parent")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && selectRole("parent")}
                  >
                    <div className="docent-role-check">✓</div>
                    <span className="docent-role-emoji">👨‍👩‍👧</span>
                    <div className="docent-role-title">Parent</div>
                  </div>
                  <div
                    className={`docent-role-card ${selectedRole === "teacher" ? "active" : ""}`}
                    onClick={() => selectRole("teacher")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && selectRole("teacher")}
                  >
                    <div className="docent-role-check">✓</div>
                    <span className="docent-role-emoji">👨‍🏫</span>
                    <div className="docent-role-title">Teacher</div>
                  </div>
                </div>

                <div className="docent-terms-row">
                  <div
                    className={`docent-custom-checkbox ${termsChecked ? "checked" : ""}`}
                    onClick={toggleTerms}
                    role="checkbox"
                    aria-checked={termsChecked}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleTerms()}
                  />
                  <p className="docent-terms-text">
                    I agree to the <Link href="/company/legal/terms">Terms</Link> and <Link href="/company/legal/privacy">Privacy Policy</Link>.
                  </p>
                </div>

                <button type="submit" className="docent-btn-submit" disabled={!acceptedTerms} id="login-btn">
                  <span>Login →</span>
                </button>
              </form>

              <div className="docent-form-switch">
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => setActiveTab("signup")} className="docent-link-btn">Sign up free</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
