import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ButtonInks – Custom Printing That Works as Hard as Your Brand",
  description:
    "T-shirts, business cards, stickers, banners, and 500+ more products. Professional quality, fast turnaround, unbeatable bulk pricing.",
  icons: {
    icon: "https://buttoninks.com/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png",
    shortcut: "https://buttoninks.com/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png",
    apple: "https://buttoninks.com/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png",
  },
  keywords: [
    "custom printing",
    "embroidery",
    "DTF prints",
    "apparel",
    "bulk printing",
    "ButtonInks",
  ],
  openGraph: {
    title: "ButtonInks – Custom Printing",
    description:
      "Professional quality custom printing with fast turnaround and unbeatable bulk pricing.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white" suppressHydrationWarning>
        {/* ── Global header (Announcement + Navbar + CategoryNav) ── */}
        <Header />

        {/* ── Page content ── */}
        <div className="flex-1">
          {children}
        </div>

        {/* ── Global footer ── */}
        <Footer />
      </body>
    </html>
  );
}
