"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export type PwaPlatform = "ios" | "android" | "other";

type PwaInstallContextValue = {
  canInstall: boolean;
  platform: PwaPlatform;
  hasNativePrompt: boolean;
  promptInstall: () => Promise<"installed" | "manual" | "dismissed">;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let listenerReady = false;

function isPwaDismissed(): boolean {
  try {
    return sessionStorage.getItem("we26_pwa_banner_dismissed") === "1";
  } catch {
    return false;
  }
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectPlatform(): PwaPlatform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIos) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function ensureInstallListener(onDeferred: () => void) {
  if (listenerReady || typeof window === "undefined") return;
  listenerReady = true;

  window.addEventListener("beforeinstallprompt", (e) => {
    if (isPwaDismissed()) return;

    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    onDeferred();
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [hasDeferred, setHasDeferred] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [platform, setPlatform] = useState<PwaPlatform>("other");

  useEffect(() => {
    setIsStandalone(detectStandalone());
    setPlatform(detectPlatform());
    setHasDeferred(Boolean(deferredPrompt));

    ensureInstallListener(() => setHasDeferred(true));
  }, []);

  const promptInstall = useCallback(async (): Promise<"installed" | "manual" | "dismissed"> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      setHasDeferred(false);
      return outcome === "accepted" ? "installed" : "dismissed";
    }
    return "manual";
  }, []);

  const value = useMemo<PwaInstallContextValue>(
    () => ({
      canInstall: !isStandalone,
      platform,
      hasNativePrompt: hasDeferred,
      promptInstall,
    }),
    [hasDeferred, isStandalone, platform, promptInstall],
  );

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

const FALLBACK: PwaInstallContextValue = {
  canInstall: false,
  platform: "other",
  hasNativePrompt: false,
  promptInstall: async () => "manual",
};

export function usePwaInstall(): PwaInstallContextValue {
  return useContext(PwaInstallContext) ?? FALLBACK;
}
