import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/ui/use-toast";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lawbridge - Smart Legal Documents & Lawyer Access",
  description: "Generate contracts in minutes, consult verified lawyers, and manage your legal needs — all in one place.",
  icons: {
    icon: "/favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  keywords: [
    "legal documents",
    "lawyer access",
    "contract generation",
    "legal services",
    "tenancy agreement",
    "freelance contract",
    "loan agreement",
    "legal consultation",
    "verified lawyers",
    "dual accounts",
  ],
  authors: [{ name: "Lawbridge", url: "https://lawbridge.com.ng" }],
  openGraph: {
    title: "Lawbridge - Smart Legal Documents & Lawyer Access",
    description: "Generate contracts in minutes, consult verified lawyers, and manage your legal needs — all in one place.",
    url: "https://lawbridge.com.ng",
    siteName: "Lawbridge",
    images: [
      {
        url: "https://lawbridge.com.ng/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lawbridge",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawbridge - Smart Legal Documents & Lawyer Access",
    description: "Generate contracts in minutes, consult verified lawyers, and manage your legal needs — all in one place.",
    images: ["https://lawbridge.com.ng/og-image.png"],
    creator: "@lawbridge",
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
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
