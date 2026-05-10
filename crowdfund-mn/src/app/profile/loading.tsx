export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">

      {/* Hero skeleton */}
      <div className="gradient-brand-hero pt-24 pb-14">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
            {/* Avatar skeleton */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/20 flex-shrink-0" />
            {/* Info skeleton */}
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 bg-white/20 rounded-xl" />
              <div className="h-4 w-56 bg-white/15 rounded-lg" />
              <div className="h-3 w-36 bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip skeleton */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="container-page">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center gap-4 py-5 px-6">
                <div className="hidden sm:block w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                <div className="space-y-2">
                  <div className="h-6 w-20 bg-slate-100 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="container-page py-8">
        <div className="h-14 w-full sm:w-96 bg-white rounded-2xl border border-slate-100 mb-8" />

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-100 shadow-card" />
          ))}
        </div>
      </div>

    </div>
  );
}
