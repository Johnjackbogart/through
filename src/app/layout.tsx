import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "&/theme-provider";
import "./globals.css";
import { IBM_Plex_Mono } from "next/font/google";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Through",
  description: "Your new partner in tech",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://through.tech"),
  title: {
    default: "Through.tech",
    template: "%s | Through.tech",
  },
  description: "Lets get through it.",
  openGraph: {
    type: "website",
    siteName: "Through.tech",
    url: "https://through.tech",
    title: "Through.tech",
    description: "Lets get through it",
    images: [
      {
        url: "/preview.png", // resolves to https://through.tech/og-image.jpg because of metadataBase
        width: 1200,
        height: 630,
        alt: "Through.tech preview image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Through.tech",
    description: "Lets get throigh it",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-mono antialiased ${ibmPlexMono.className}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
