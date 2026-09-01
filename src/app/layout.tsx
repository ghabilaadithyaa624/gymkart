import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import MobileTabs from "@/components/mobile-tabs";
import Footer from "@/components/footer";
import InstallPwaBanner from "@/components/InstallPwaBanner";
import { ToastHost } from "@/components/ui";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "GymKart — Fitness Gear, Supplements & Gym Essentials Online in India",
  description:
    "India's smart marketplace for fitness gear, supplements and gym essentials. Bestseller badges, verified ratings, COD available, free delivery over ₹999.",
  applicationName: "GymKart",
  manifest: "/manifest.webmanifest",
  themeColor: "#1a1a1a",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "GymKart" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-svh font-sans antialiased">
        <Navbar />
        <div className="pb-20 lg:pb-0">{children}</div>
        <Footer />
        <MobileTabs />
        <InstallPwaBanner />
        <ToastHost />
      </body>
    </html>
  );
}
