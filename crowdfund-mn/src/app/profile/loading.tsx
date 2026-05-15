function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`} />;
}

export default function ProfileLoading() {
  return (
    <main className="min-h-screen bg-slate-50 pt-24">
      <div className="container-page">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Skeleton className="h-24 w-24 shrink-0" />
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-10 w-72 max-w-full" />
                <Skeleton className="h-4 w-full max-w-xl" />
                <Skeleton className="h-4 w-2/3 max-w-md" />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-4 h-2 w-full rounded-full" />
              <Skeleton className="mt-4 h-11 w-full" />
            </div>
          </div>
        </section>

        <div className="grid gap-3 py-5 sm:grid-cols-3">
          {[0, 1, 2].map(item => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Skeleton className="h-11 w-11 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map(item => (
            <Skeleton key={item} className="h-12 w-36 rounded-t-2xl" />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map(item => (
            <div key={item} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid sm:grid-cols-[170px_minmax(0,1fr)]">
                <Skeleton className="h-44 rounded-none sm:h-full" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
