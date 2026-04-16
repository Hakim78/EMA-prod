"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Zap } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import GlobalCopilot from "@/components/GlobalCopilot";
import SplashScreen from "@/components/SplashScreen";

// ── Notification helpers ─────────────────────────────────────────────────────
function showLocalNotification(title: string, body: string, url: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const n = new Notification(title, {
    body,
    icon: "/icon.svg",
    badge: "/icon.svg",
    tag: "edrcf-signal",
    data: { url },
  });
  n.onclick = () => { window.focus(); window.location.href = url; };
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  // ── Service Worker registration ──────────────────────────────────────────
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((err) => console.warn("[SW] Registration failed:", err));
    }
  }, []);

  // ── Capture PWA install prompt ───────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Sync notification permission state ──────────────────────────────────
  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotifPermission(Notification.permission);
    }
  }, []);

  // ── Expose helpers to children via custom events ─────────────────────────
  const requestNotificationPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      showLocalNotification(
        "EDRCF 6.0 — Notifications activées",
        "Vous recevrez les signaux M&A en temps réel.",
        "/"
      );
    }
  }, []);

  useEffect(() => {
    const handler = () => requestNotificationPermission();
    window.addEventListener("edrcf-request-notif", handler);
    return () => window.removeEventListener("edrcf-request-notif", handler);
  }, [requestNotificationPermission]);

  useEffect(() => {
    const handler = () => {
      if (installPrompt) {
        (installPrompt as any).prompt?.();
      }
    };
    window.addEventListener("edrcf-install-app", handler);
    return () => window.removeEventListener("edrcf-install-app", handler);
  }, [installPrompt]);

  // ── Periodic signal check → local notification ────────────────────────────
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const check = async () => {
      try {
        const res = await fetch("/api/targets");
        if (!res.ok) return;
        const data = await res.json();
        const currentCount: number = (data.data || []).reduce(
          (acc: number, t: { topSignals?: unknown[] }) => acc + (t.topSignals?.length || 0),
          0
        );
        const storedKey = "edrcf-last-signal-count";
        const stored = parseInt(localStorage.getItem(storedKey) || "0", 10);
        if (currentCount > stored && stored > 0) {
          const diff = currentCount - stored;
          showLocalNotification(
            "EDRCF 6.0 — Nouveaux signaux",
            `${diff} nouveau${diff > 1 ? "x" : ""} signal${diff > 1 ? "s" : ""} M&A détecté${diff > 1 ? "s" : ""}.`,
            "/signals"
          );
        }
        localStorage.setItem(storedKey, String(currentCount));
      } catch {
        // silent fail
      }
    };

    check();
    const interval = setInterval(check, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, [notifPermission]);

  return (
    <>
      <SplashScreen />

      <div className="print:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          notifPermission={notifPermission}
          hasInstallPrompt={!!installPrompt}
        />
      </div>

      <main className="lg:pl-72 min-h-screen relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 sm:p-6 bg-black/40 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-[80] print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-black text-sm tracking-tighter uppercase block leading-none">EdRCF 6.0</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Global Ambient Background */}
        <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />
          <div className="absolute top-[30%] -left-[5%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px]" />
          <div className="absolute bottom-0 right-[20%] w-[20%] h-[20%] rounded-full bg-indigo-500/5 blur-[100px]" />
        </div>

        <div className="p-4 md:p-8">
          {children}
        </div>

        {/* Quick Access Helper — desktop only */}
        <div className="fixed bottom-6 right-6 z-40 hidden lg:block print:hidden">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-[10px] text-gray-400 font-black tracking-widest uppercase shadow-2xl">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20">⌘</span>
              <span className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20">K</span>
            </span>
            Search Intelligence
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <CommandPalette />
        <GlobalCopilot />
      </div>
    </>
  );
}
