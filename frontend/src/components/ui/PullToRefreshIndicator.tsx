"use client";

import { motion } from "framer-motion";

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export default function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <motion.div
      className="flex items-center justify-center py-3 lg:hidden"
      style={{ height: pullDistance }}
      animate={{ opacity: progress > 0.2 ? 1 : 0 }}
    >
      {isRefreshing ? (
        <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      ) : (
        <motion.div
          className="w-6 h-6 rounded-full border-2 border-indigo-500/30 flex items-center justify-center"
          style={{ rotate: `${progress * 180}deg` }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-indigo-400"
          >
            <path
              d="M6 2v8M6 10l-3-3M6 10l3-3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
