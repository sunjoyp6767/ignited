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
  title: {
    default: "IgnitED Faculty Corner",
    template: "%s · IgnitED",
  },
  description:
    "O & A Level coaching in Lalmatia, Dhaka — Cambridge & Edexcel, expert faculty, hybrid learning, and lab-supported science.",
  icons: {
    icon: [{ url: "/assets/site_icon.png", type: "image/png" }],
    shortcut: "/assets/site_icon.png",
    apple: "/assets/site_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
