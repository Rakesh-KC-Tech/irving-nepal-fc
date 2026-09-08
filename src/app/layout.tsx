import type { Metadata } from "next";
import { Oswald, Inter, Teko } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Irving Nepal FC — Member Portal",
  description: "Membership, teams, and payments portal for Irving Nepal FC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${inter.variable} ${teko.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy text-white">
        {children}
      </body>
    </html>
  );
}
