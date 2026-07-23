import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOOR E HARAM Charity Foundation Admin",
  description: "Official admin dashboard for NOOR E HARAM Charity Foundation"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
