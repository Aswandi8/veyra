"use client";

import * as React from "react";

interface SidebarScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const HIDE_DELAY = 1200;

export function SidebarScrollArea({
  children,
  className = "",
}: SidebarScrollAreaProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleScroll() {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    /*
     * Tampilkan scrollbar saat user scroll.
     */
    element.classList.add("is-scrolling");

    /*
     * Reset timer sebelumnya.
     */
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    /*
     * Setelah user berhenti scroll,
     * sembunyikan scrollbar lagi.
     */
    hideTimerRef.current = setTimeout(() => {
      element.classList.remove("is-scrolling");
    }, HIDE_DELAY);
  }

  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain ${className}`}
    >
      {children}
    </div>
  );
}
