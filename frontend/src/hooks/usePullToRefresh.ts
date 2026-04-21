import { useState, useEffect, useRef, useCallback } from "react";

const PULL_THRESHOLD = 80;

export function usePullToRefresh(
  ref: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>
): { isRefreshing: boolean; pullDistance: number } {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const touchStartY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const element = ref.current;
    if (!element) return;

    const scrollTop =
      element.scrollTop ?? element.scrollTop;
    if (scrollTop > 0) return;

    touchStartY.current = e.touches[0].clientY;
    isPulling.current = true;
  }, [ref]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || isRefreshingRef.current) return;

    const element = ref.current;
    if (!element) return;

    if (element.scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY.current;

    if (delta <= 0) {
      setPullDistance(0);
      return;
    }

    // Apply rubber-band resistance so pull feels natural
    const resistance = 0.4;
    const distance = Math.min(delta * resistance, PULL_THRESHOLD * 1.5);
    setPullDistance(distance);
  }, [ref]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshingRef.current) return;

    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD); // Hold indicator at threshold during refresh

      try {
        await onRefresh();
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, onRefresh]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: true });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { isRefreshing, pullDistance };
}
