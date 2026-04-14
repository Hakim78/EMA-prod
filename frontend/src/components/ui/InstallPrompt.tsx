"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";

const DISMISSAL_KEY = "install-prompt-dismissed-until";
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the user has previously dismissed the prompt
    const dismissedUntil = localStorage.getItem(DISMISSAL_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      deferredPrompt.current = null;
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(
      DISMISSAL_KEY,
      String(Date.now() + DISMISSAL_DURATION_MS)
    );
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="install-prompt"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-[72px] inset-x-0 z-50 flex justify-center px-4 lg:hidden"
        >
          <div className="w-full max-w-sm rounded-2xl bg-black/80 border border-white/10 backdrop-blur-md shadow-xl px-4 py-3 flex items-center gap-3">
            {/* Icon */}
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-indigo-400" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white leading-tight">
                Installer l&apos;application
              </p>
              <p className="text-xs text-white/50 truncate">
                Accès rapide depuis l&apos;écran d&apos;accueil
              </p>
            </div>

            {/* Install button */}
            <button
              onClick={handleInstall}
              className="flex-shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              Installer
            </button>

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              aria-label="Fermer"
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
