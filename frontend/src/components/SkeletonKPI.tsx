import { motion } from 'framer-motion';

export function SkeletonKPI() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-2xl"
    >
      <div className="animate-pulse">
        <div className="flex justify-between items-start mb-4 sm:mb-6 lg:mb-8">
          <div className="p-2.5 sm:p-3 lg:p-3.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/10 rounded" />
          </div>
          <div className="w-10 sm:w-12 h-5 bg-white/10 rounded-xl" />
        </div>
        <div className="w-16 sm:w-20 h-7 sm:h-10 bg-white/10 rounded mb-1 sm:mb-2" />
        <div className="w-20 sm:w-24 h-3 sm:h-4 bg-white/10 rounded" />
      </div>
    </motion.div>
  );
}
