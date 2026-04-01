import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/shared";

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
    default: "airyty — Find your perfect stay",
    template: "%s | airyty",
  },
  description:
    "Discover and book unique places to stay around the world. List your property and start hosting with airyty.",
  keywords: ["vacation rental", "accommodation", "travel", "airbnb", "stays"],
  openGraph: {
    title: "airyty — Find your perfect stay",
    description:
      "Discover and book unique places to stay around the world with airyty.",
    type: "website",
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
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
      </body>
    </html>
  );
}
