import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * TEMP SUBSTITUTE for the brand display face (Genova Medium). The real
 * Genova font files were not supplied to this session — see the
 * implementation notes for how to swap this for next/font/local once
 * they're added under /public/fonts.
 */
const headingFont = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Creatvo — Media production for organizations",
  description:
    "Creatvo creates documentary, photography and video content that helps humanitarian organizations and institutions communicate their work, amplify impact and connect people to the stories that matter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
