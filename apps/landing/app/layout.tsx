import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IFS - Insecure File Sharing | Share Files Instantly",
  description:
    "Upload a file, get a 4-character code, share it. No sign-up required. Files auto-delete after 24 hours.",
  keywords: [
    "file sharing",
    "file transfer",
    "share files",
    "upload files",
    "temporary files",
  ],
  openGraph: {
    title: "IFS - Insecure File Sharing",
    description:
      "Share files instantly with a 4-character code. No sign-up required.",
    url: "https://ifs.kenf.dev",
    siteName: "IFS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IFS - Insecure File Sharing",
    description:
      "Share files instantly with a 4-character code. No sign-up required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
