"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "veyra-theme";

const THEME_CHANGE_EVENT = "veyra:theme-change";

/* ============================================================
   HELPERS
   ============================================================ */

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return null;
}

function getThemeSnapshot(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function getServerSnapshot(): Theme {
  /*
   * Snapshot stabil saat SSR.
   *
   * Theme sebenarnya akan dibaca
   * setelah hydration.
   */
  return "light";
}

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") {
    return;
  }

  const html = document.documentElement;

  html.classList.toggle("dark", theme === "dark");

  html.style.colorScheme = theme;
}

/* ============================================================
   EXTERNAL STORE SUBSCRIPTION
   ============================================================ */

function subscribeTheme(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function handleThemeChange() {
    callback();
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  }

  function handleSystemTheme() {
    /*
     * System theme hanya dipakai
     * kalau user belum memilih
     * preference sendiri.
     */
    if (!getStoredTheme()) {
      callback();
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

  window.addEventListener("storage", handleStorage);

  media.addEventListener("change", handleSystemTheme);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);

    window.removeEventListener("storage", handleStorage);

    media.removeEventListener("change", handleSystemTheme);
  };
}

/* ============================================================
   PROVIDER
   ============================================================ */

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  /*
   * Effect ini valid.
   *
   * Kita TIDAK melakukan setState.
   * Kita hanya menyinkronkan React
   * dengan external system:
   *
   * <html class="dark">
   */
  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);

    applyTheme(nextTheme);

    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/* ============================================================
   HOOK
   ============================================================ */

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
