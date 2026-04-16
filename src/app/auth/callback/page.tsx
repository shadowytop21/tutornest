"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveSession, updateProfile } from "@/lib/mock-db";
import { getSupabaseBrowserClient } from "@/lib/supabase";

function buildFallbackName(email: string) {
  const localPart = email.split("@")[0] ?? "User";
  if (!localPart) {
    return "User";
  }

  return localPart
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let isActive = true;

    async function completeGoogleLogin() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        router.replace("/auth?oauth=error");
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const exchange = await client.auth.exchangeCodeForSession(code);
        if (exchange.error) {
          router.replace("/auth?oauth=error");
          return;
        }
      }

      const userResult = await client.auth.getUser();
      const user = userResult.data.user;
      if (userResult.error || !user?.email) {
        router.replace("/auth?oauth=error");
        return;
      }

      if (!isActive) {
        return;
      }

      const roleParam = searchParams.get("role");
      const role: "teacher" | "parent" = roleParam === "teacher" ? "teacher" : "parent";
      const next = searchParams.get("next");
      const nameFromProvider =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        buildFallbackName(user.email);

      const phoneDigits = user.id.replace(/\D/g, "").slice(0, 10).padEnd(10, "0");
      const syntheticPhone = `+91${phoneDigits}`;
      const response = await fetch("/api/account/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: nameFromProvider,
          phone: syntheticPhone,
          role,
          acceptedTerms: true,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string; userId?: string };
      if (!response.ok || !payload.userId) {
        await client.auth.signOut();
        router.replace("/auth?oauthError=1");
        return;
      }

      saveSession({
        id: payload.userId,
        phone: syntheticPhone,
        name: nameFromProvider,
        email: user.email,
        role,
      });

      updateProfile({
        id: payload.userId,
        role,
        name: nameFromProvider,
        phone: syntheticPhone,
        email: user.email,
        created_at: new Date().toISOString(),
      });

      router.replace(
        role === "teacher"
          ? (next && next.startsWith("/") ? next : "/teacher/setup")
          : (next && next.startsWith("/") ? next : "/browse"),
      );
    }

    completeGoogleLogin();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Completing Google login...</div>;
}
