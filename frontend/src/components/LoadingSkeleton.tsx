export function SkeletonCard() {
  return (
    <div className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-black/40 border border-white/10 animate-pulse">
      <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="h-7 w-40 sm:w-56 bg-white/5 rounded-xl sm:rounded-2xl" />
            <div className="h-5 w-20 sm:w-24 bg-white/[0.03] rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">
            <div className="h-7 sm:h-8 w-24 sm:w-32 bg-white/[0.03] rounded-xl sm:rounded-2xl" />
            <div className="h-7 sm:h-8 w-20 sm:w-28 bg-white/[0.03] rounded-xl sm:rounded-2xl" />
          </div>
        </div>
        <div className="h-12 sm:h-14 w-12 sm:w-14 bg-white/5 rounded-xl sm:rounded-2xl shrink-0" />
      </div>
      <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-5 sm:gap-8">
          <div>
            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/[0.03] rounded-lg mb-2" />
            <div className="h-4 sm:h-5 w-24 sm:w-32 bg-white/5 rounded-lg sm:rounded-xl" />
          </div>
          <div>
            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-white/[0.03] rounded-lg mb-2" />
            <div className="h-4 sm:h-5 w-20 sm:w-28 bg-white/5 rounded-lg sm:rounded-xl" />
          </div>
        </div>
        <div className="h-11 sm:h-12 w-full sm:w-48 bg-white/5 rounded-2xl" />
      </div>
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-black/40 border border-white/10 animate-pulse">
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-white/5" />
        <div className="w-12 sm:w-16 h-5 sm:h-6 rounded-full bg-white/[0.03]" />
      </div>
      <div className="h-7 sm:h-10 w-20 sm:w-28 bg-white/5 rounded-xl sm:rounded-2xl mb-2 sm:mb-3" />
      <div className="h-3 sm:h-4 w-28 sm:w-40 bg-white/[0.03] rounded-lg sm:rounded-xl" />
    </div>
  );
}
