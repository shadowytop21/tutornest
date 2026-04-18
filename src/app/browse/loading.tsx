export default function BrowseLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-20">
      <section className="card-surface overflow-hidden rounded-[1rem]">
        <div className="browse-hero">
          <div className="mb-3 h-10 w-72 animate-pulse rounded-xl bg-[var(--ivory2)]" />
          <div className="h-5 w-96 max-w-full animate-pulse rounded-full bg-[var(--ivory2)]" />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] bg-white px-6 py-5 lg:px-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-9 w-24 animate-pulse rounded-full bg-[var(--ivory2)]" />
          ))}
        </div>

        <div className="grid min-h-[600px] lg:grid-cols-[280px_1fr]">
          <aside className="hidden border-r border-[var(--border)] bg-white p-8 lg:block">
            <div className="mb-7 h-12 animate-pulse rounded-xl bg-[var(--ivory2)]" />
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="mb-3 h-10 animate-pulse rounded-lg bg-[var(--ivory2)]" />
            ))}
          </aside>

          <section className="teacher-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="teacher-card tcard">
                <div className="h-[6px] bg-[var(--saffron-mid)]" />
                <div className="p-4">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--ivory2)]" />
                    <div className="flex-1">
                      <div className="mb-2 h-5 w-32 animate-pulse rounded-md bg-[var(--ivory2)]" />
                      <div className="h-4 w-40 animate-pulse rounded-md bg-[var(--ivory2)]" />
                    </div>
                  </div>

                  <div className="mb-3 flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--ivory2)]" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-[var(--ivory2)]" />
                  </div>

                  <div className="mb-3 h-16 animate-pulse rounded-xl bg-[var(--ivory2)]" />
                  <div className="h-5 w-full animate-pulse rounded-full bg-[var(--ivory2)]" />
                </div>

                <div className="flex items-center justify-between border-t border-[var(--border)] p-4">
                  <div className="h-8 w-20 animate-pulse rounded-md bg-[var(--ivory2)]" />
                  <div className="h-10 w-28 animate-pulse rounded-full bg-[var(--navy)]/15" />
                </div>
              </article>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}
