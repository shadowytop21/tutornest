import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteFooter() {
  return (
    <footer className="bg-[var(--navy3)] text-white">
      <div className="mx-auto w-full max-w-7xl border-t border-white/10">
        <div className="grid gap-0 border-b border-white/10 lg:grid-cols-3">
          <Link href="/browse" className="flex items-center gap-3 border-b border-white/10 px-5 py-4 transition hover:bg-white/5 lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(232,134,10,0.12)]">📚</div>
            <div>
              <p className="text-sm text-white/75">Home Tutors</p>
              <p className="font-mono text-[10px] text-white/35">Live tutor listings</p>
            </div>
            <span className="ml-auto text-white/30">→</span>
          </Link>
          <Link href="/coaching" className="flex items-center gap-3 border-b border-white/10 px-5 py-4 transition hover:bg-white/5 lg:border-b-0 lg:border-r lg:border-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(30,64,175,0.2)]">🎯</div>
            <div>
              <p className="text-sm text-white/75">Coaching Institutes</p>
              <p className="font-mono text-[10px] text-white/35">Compare and enquire</p>
            </div>
            <span className="ml-auto text-white/30">→</span>
          </Link>
          <Link href="/schools" className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(13,115,119,0.2)]">🏫</div>
            <div>
              <p className="text-sm text-white/75">Schools</p>
              <p className="font-mono text-[10px] text-white/35">Explore school profiles</p>
            </div>
            <span className="ml-auto text-white/30">→</span>
          </Link>
        </div>

        <div className="grid gap-10 px-6 py-12 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--saffron)]">
                <Image src="/docent-mark-v2.png?v=5" alt="Docent logo" width={18} height={18} quality={80} loading="lazy" className="h-[18px] w-[18px]" />
              </div>
              <span className="font-mono text-[15px] tracking-[0.08em] text-white">Docent</span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/45">Mathura&apos;s complete education discovery platform from home tutors to top coaching centres and schools.</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Currently live in Mathura, UP
            </div>
            <div className="mt-5 flex gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs">𝕏</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs">in</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs">📸</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs">💬</span>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">For Parents</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/50">
              <Link href="/browse" className="hover:text-white">Browse Tutors</Link>
              <Link href="/coaching" className="hover:text-white">Find Coaching</Link>
              <Link href="/schools" className="hover:text-white">Explore Schools</Link>
              <Link href="/schools/compare" className="hover:text-white">Compare Schools</Link>
              <Link href="/#how-it-works" className="hover:text-white">How it Works</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">For Providers</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/50">
              <JoinAsTeacherAction className="text-left hover:text-white">Join as Tutor</JoinAsTeacherAction>
              <Link href="/coaching/register" className="hover:text-white">List your Institute</Link>
              <Link href="/schools/register" className="hover:text-white">Register your School</Link>
              <Link href="/teacher/dashboard" className="hover:text-white">Teacher Dashboard</Link>
              <Link href="/teacher/setup" className="hover:text-white">Verification</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">Company</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-white/50">
              <Link href="/company" className="hover:text-white">About Docent</Link>
              <Link href="/auth" className="hover:text-white">Login</Link>
              <a href="mailto:docentsupport@gmail.com" className="hover:text-white">docentsupport@gmail.com</a>
              <Link href="/company/legal/privacy" className="hover:text-white">Privacy Policy</Link>
              <Link href="/company/legal/terms" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-6 py-4 lg:px-8">
          <p className="text-xs text-white/30">© 2026 Docent · Made with care in Mathura, India</p>
          <div className="flex items-center gap-5 text-xs text-white/30">
            <Link href="/company/legal/privacy" className="hover:text-white/60">Privacy</Link>
            <Link href="/company/legal/terms" className="hover:text-white/60">Terms</Link>
            <Link href="/company/legal/cookies" className="hover:text-white/60">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
