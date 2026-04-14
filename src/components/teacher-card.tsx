import Image from "next/image";
import Link from "next/link";
import { type TeacherProfile } from "@/lib/data";

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <Link
      href={`/teacher/${teacher.id}`}
      className="group block rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Image
            src={teacher.photo_url}
            alt={teacher.name}
            width={56}
            height={56}
            quality={80}
            loading="lazy"
            unoptimized
            className={`h-14 w-14 rounded-full object-cover ring-2 ${teacher.status === "verified" ? "ring-[var(--accent)]" : "ring-[var(--border)]"}`}
          />
          <span className={`absolute -right-0.5 bottom-0 h-3 w-3 rounded-full border-2 border-white ${teacher.status === "verified" ? "bg-[var(--success)]" : teacher.status === "pending" ? "bg-slate-300" : "bg-rose-400"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate font-display text-base font-semibold text-[var(--foreground)]">{teacher.name}</h3>
            {teacher.status === "verified" && (
              <span className="rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--success)]">✓ Verified</span>
            )}
            {teacher.is_founding_member && (
              <span className="rounded-full bg-[var(--accent-light)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">★ Founding</span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{teacher.bio}</p>
        </div>
      </div>

      {/* Subjects */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {teacher.subjects.slice(0, 4).map((s) => (
          <span key={s} className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">{s}</span>
        ))}
      </div>

      {/* Meta row */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="text-[var(--muted)]">
          <span className="font-medium text-[var(--foreground)]">{teacher.locality}</span>
          {" · "}
          {teacher.experience_years}yr exp
        </div>
        <div className="text-right">
          <span className="font-bold text-[var(--foreground)]">₹{teacher.price_per_month}</span>
          <span className="text-xs text-[var(--muted)]">/mo</span>
        </div>
      </div>

      {/* Rating + grades */}
      <div className="mt-2 flex items-center justify-between text-xs text-[var(--muted)]">
        <span>⭐ {teacher.rating.toFixed(1)}</span>
        <span>{teacher.grades.slice(0, 3).join(", ")}</span>
      </div>
    </Link>
  );
}
