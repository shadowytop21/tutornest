"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast-provider";
import { isAdminAuthValid, saveAdminAuth } from "@/lib/mock-db";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

export default function AdminLoginPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setLoaded(true);
    if (ADMIN_EMAIL && isAdminAuthValid(ADMIN_EMAIL)) {
      router.replace("/admin");
    }
  }, [router]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ADMIN_EMAIL) {
      pushToast({ tone: "error", title: "ADMIN_EMAIL is missing" });
      return;
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase()) {
      pushToast({ tone: "error", title: "Access denied", description: "That email does not match the admin email." });
      return;
    }

    if (ADMIN_PASSWORD && password !== ADMIN_PASSWORD) {
      pushToast({ tone: "error", title: "Access denied", description: "The password does not match the admin password." });
      return;
    }

    saveAdminAuth(email);
    pushToast({ tone: "success", title: "Admin login successful" });
    router.replace("/admin");
  }

  if (!loaded) {
    return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Loading admin login...</div>;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center px-4 py-10 sm:px-6 lg:px-8 lg:py-20">
      <form className="card-surface w-full rounded-[2rem] p-8" onSubmit={handleSubmit}>
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Hidden admin login</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-[var(--foreground)]">Admin access</h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          Enter the admin email and password to open the moderation panel.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Email</label>
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">Password</label>
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required={Boolean(ADMIN_PASSWORD)} />
            <p className="mt-2 text-xs text-[var(--muted)]">Use the admin password configured in your local environment.</p>
          </div>
          <button type="submit" className="btn-primary w-full px-5 py-3">Open admin panel</button>
        </div>
      </form>
    </div>
  );
}