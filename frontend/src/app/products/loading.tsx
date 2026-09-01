export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex gap-8">
        <div className="hidden w-60 shrink-0 space-y-3 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-24 w-full" />
          ))}
        </div>
        <div className="flex-1">
          <div className="skeleton mb-2 h-7 w-48" />
          <div className="skeleton mb-6 h-4 w-24" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="skeleton aspect-[4/3] !rounded-none" />
                <div className="space-y-2 p-3.5">
                  <div className="skeleton h-3 w-14" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-5 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
