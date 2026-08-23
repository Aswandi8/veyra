import type { Metadata } from "next";

import "./globals.css";

import { Providers } from "@/providers/providers";

export const metadata: Metadata = {
  title: {
    default: "Veyra",
    template: "%s | Veyra",
  },

  description: "Veyra Central Management System",
};

const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem("veyra-theme");

    var theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches
          ? "dark"
          : "light";

    var html = document.documentElement;

    html.classList.toggle(
      "dark",
      theme === "dark"
    );

    html.style.colorScheme = theme;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
      </head>

      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
