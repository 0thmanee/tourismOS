import "~/styles/globals.css";

import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import { QueryProvider } from "~/components/providers/query-provider";

export const metadata: Metadata = {
  title: "TourismOS — Operator Inbox & Booking",
  description: "Replace WhatsApp chaos for Moroccan tourism operators with a structured inbox and booking workflow.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${playfair.variable} ${spaceGrotesk.variable}`} lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
