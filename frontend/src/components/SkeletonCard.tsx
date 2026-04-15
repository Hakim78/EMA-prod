import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-5 sm:p-7 lg:p-10 rounded-2xl sm:rounded-[2rem] lg:rounded-[3rem] bg-black/40 border border-white/10 relative overflow-hidden backdrop-blur-3xl shadow-2xl"
    >
      <div className="animate-pulse">
        <div className="flex justify-between items-start gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 sm:gap-5 mb-3 sm:mb-5">
              <div className="w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="w-3/4 h-6 sm:h-8 bg-white/10 rounded mb-2" />
                <div className="flex gap-2 sm:gap-3 items-center">
                  <div className="w-20 sm:w-24 h-5 sm:h-6 bg-white/10 rounded-lg sm:rounded-xl" />
                  <div className="w-16 sm:w-20 h-4 bg-white/10 rounded" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-8">
              <div className="w-24 sm:w-32 h-7 sm:h-8 bg-white/5 rounded-xl sm:rounded-2xl" />
              <div className="w-28 sm:w-36 h-7 sm:h-8 bg-white/5 rounded-xl sm:rounded-2xl" />
              <div className="hidden sm:block w-28 h-8 bg-white/5 rounded-2xl" />
            </div>
          </div>

          <div className="flex flex-col items-end shrink-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded mb-1.5 sm:mb-3" />
            <div className="w-14 sm:w-20 h-3 sm:h-4 bg-white/10 rounded" />
          </div>
        </div>

        <div className="mt-5 sm:mt-8 lg:mt-10 pt-4 sm:pt-6 lg:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="flex flex-wrap gap-5 sm:gap-8 lg:gap-12">
            <div className="space-y-1.5">
              <div className="w-20 h-4 bg-white/10 rounded" />
              <div className="w-24 h-5 sm:h-6 bg-white/10 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="w-24 h-4 bg-white/10 rounded" />
              <div className="w-20 h-5 sm:h-6 bg-white/10 rounded" />
            </div>
          </div>

          <div className="w-full md:w-32 h-11 sm:h-12 bg-white/10 rounded-2xl" />
        </div>
      </div>
    </motion.div>
  );
}
