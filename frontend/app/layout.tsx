import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../src/index.css";
import { Providers } from "./providers";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--app-font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "TutorFinder — Pakistan's #1 Tutoring Platform",
  description:
    "Connect with 2,500+ verified tutors in Lahore, Islamabad and Karachi. Start with a 2-day free trial.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.variable} min-h-screen bg-background font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
