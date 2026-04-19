import Image from "next/image";
import Link from "next/link";
import { JoinAsTeacherAction } from "@/components/join-as-teacher-action";

export function SiteFooter() {
  return (
    <footer className="bg-gradient-to-br from-[var(--ivory2)] via-[var(--ivory)] to-[var(--saffron-light)] text-[var(--navy)]">
      <div className="mx-auto w-full max-w-7xl border-t border-[var(--border)]">
        <div className="grid gap-10 px-6 py-12 lg:grid-cols-[1.8fr_1fr_1fr_1fr] lg:px-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-decoration-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--saffron)] transition hover:bg-[var(--navy)]">
                <Image src="/docent-mark-v2.png?v=5" alt="Docent logo" width={20} height={20} quality={80} className="h-5 w-5" />
              </div>
              <span className="font-semibold text-[var(--navy)]">Docent</span>
            </Link>
            <p className="mt-4 text-xs leading-7 text-[var(--muted)]">Making education discovery simple and transparent for families across India.</p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted2)]">For Learners</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]">
              <Link href="/browse" className="hover:text-[var(--saffron)]">Find Tutors</Link>
              <Link href="/coaching" className="hover:text-[var(--saffron)]">Browse Institutes</Link>
              <Link href="/schools" className="hover:text-[var(--saffron)]">Explore Schools</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted2)]">For Providers</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]">
              <JoinAsTeacherAction className="text-left hover:text-[var(--saffron)]">Join as Tutor</JoinAsTeacherAction>
              <Link href="/coaching/register" className="hover:text-[var(--saffron)]">List your Institute</Link>
              <Link href="/schools/register" className="hover:text-[var(--saffron)]">Register your School</Link>
              <Link href="/teacher/dashboard" className="hover:text-[var(--saffron)]">Teacher Dashboard</Link>
              <Link href="/teacher/setup" className="hover:text-[var(--saffron)]">Verification</Link>
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted2)]">Company</p>
            <div className="mt-4 flex flex-col gap-2.5 text-sm text-[var(--muted)]">
              <Link href="/company" className="hover:text-[var(--saffron)]">About Docent</Link>
              <Link href="/auth" className="hover:text-[var(--saffron)]">Login</Link>
              <a href="mailto:docentsupport@gmail.com" className="hover:text-[var(--saffron)]">docentsupport@gmail.com</a>
              <Link href="/company/legal/privacy" className="hover:text-[var(--saffron)]">Privacy Policy</Link>
              <Link href="/company/legal/terms" className="hover:text-[var(--saffron)]">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4 lg:px-8">
          <p className="text-xs text-[var(--muted2)]">© 2026 Docent · Made with care in Mathura, India</p>
          <div className="flex items-center gap-5 text-xs text-[var(--muted2)]">
            <Link href="/company/legal/privacy" className="hover:text-[var(--saffron)]">Privacy</Link>
            <Link href="/company/legal/terms" className="hover:text-[var(--saffron)]">Terms</Link>
            <Link href="/company/legal/cookies" className="hover:text-[var(--saffron)]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
