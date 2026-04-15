"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

      const role = searchParams.get("role");
      const next = searchParams.get("next");
      const nameFromProvider =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        buildFallbackName(user.email);

      const params = new URLSearchParams();
      params.set("email", user.email);
      params.set("name", nameFromProvider);

      if (role === "teacher" || role === "parent") {
        params.set("role", role);
      }

      if (next && next.startsWith("/")) {
        params.set("next", next);
      }

      params.set("oauth", "google");
      router.replace(`/auth?${params.toString()}`);
    }

    completeGoogleLogin();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return <div className="mx-auto max-w-2xl px-4 py-24 text-center text-[var(--muted)]">Completing Google login...</div>;
}
