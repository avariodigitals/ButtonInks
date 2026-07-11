import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import ShellWrapper from "@/components/ShellWrapper";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import ScrollToTop from "@/components/ScrollToTop";
import { WP_URL } from "@/lib/wordpress";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ButtonInks – Custom Printing That Works as Hard as Your Brand",
  description:
    "T-shirts, business cards, stickers, banners, and 500+ more products. Professional quality, fast turnaround, unbeatable bulk pricing.",
  icons: {
    icon: `${WP_URL}/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png`,
    shortcut: `${WP_URL}/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png`,
    apple: `${WP_URL}/wp-content/uploads/2026/06/cropped-Screenshot_3-removebg-preview.png`,
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
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-white touch-pan-y overflow-x-hidden" suppressHydrationWarning>
        <NotificationProvider>
          <CartProvider>
            <ShellWrapper>
              {children}
            </ShellWrapper>
            <ScrollToTop />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
