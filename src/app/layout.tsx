import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { publicSiteUrl } from "@/config/site";
import "@fontsource-variable/noto-sans-khmer";
import "./globals.css";

const heading = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2", weight: "300 700", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
});

const body = localFont({
  src: "../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});

const url = publicSiteUrl();
const description = "Discover Moonique Shop’s traditional Cambodian homemade foods, snacks and desserts. Browse the menu and prepare an order summary.";

export const metadata: Metadata = {
  metadataBase: url ? new URL(url) : undefined,
  title: "Moonique Shop | Homemade Cambodian Food",
  description,
  alternates: url ? { canonical: "/" } : undefined,
  manifest: "/manifest.webmanifest",
  applicationName: "Moonique Shop",
  openGraph: {
    type: "website",
    siteName: "Moonique Shop",
    title: "Moonique Shop | Homemade Cambodian Food",
    description,
    ...(url ? { url, images: [{ url: "/images/branding/social.jpg", alt: "Illustrative Cambodian food platter on banana leaves" }] } : {}),
  },
  twitter: { card: "summary_large_image", title: "Moonique Shop", description, ...(url ? { images: ["/images/branding/social.jpg"] } : {}) },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#6F3828" };

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>;
}
