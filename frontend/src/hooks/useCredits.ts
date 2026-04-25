"use client";

import { useSyncExternalStore } from "react";

const KEY = "ema_contact_credits";
const EVENT = "ema_credits_changed";
const DEFAULT = 47;

function read(): number {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const v = localStorage.getItem(KEY);
    if (v === null) return DEFAULT;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function write(n: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, String(n));
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  return String(read());
}

function getServerSnapshot(): string {
  return String(DEFAULT);
}

export function useCredits(): { credits: number; deduct: () => boolean; refund: (n?: number) => void; reset: () => void } {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const credits = parseInt(value, 10);

  const deduct = (): boolean => {
    const current = read();
    if (current <= 0) return false;
    write(current - 1);
    return true;
  };

  const refund = (n: number = 1) => {
    write(read() + n);
  };

  const reset = () => {
    write(DEFAULT);
  };

  return { credits, deduct, refund, reset };
}
