"use client";

import { useEffect } from "react";

interface SocialShareRedirectProps {
  targetUrl: string;
}

export function SocialShareRedirect({ targetUrl }: SocialShareRedirectProps) {
  useEffect(() => {
    /*
     * replace(), bukan push().
     *
     * Dengan begitu tombol Back browser tidak
     * terus kembali ke intermediary share page.
     */
    window.location.replace(targetUrl);
  }, [targetUrl]);

  return null;
}
