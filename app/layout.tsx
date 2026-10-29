import type { Metadata } from "next";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { SiteChrome } from "@/components/site/site-chrome";
import { ScrollTopOnRoute } from "@/components/site/scroll-top-on-route";
import { Preloader } from "@/components/ui/preloader";
import { StoreProvider } from "@/components/store/store-provider";
import { StoreMount } from "@/components/store/store-mount";
import "./globals.css";

// Self-hosted via /public/fonts to avoid flaky Google Fonts fetches during
// Vercel builds (previously crashed deploy with
// `TypeError: Cannot read properties of null (reading '1')` in next/font/google).
const display = localFont({
  src: [
    { path: "../public/fonts/InterTight-Medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/InterTight-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/InterTight-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/InterTight-ExtraBold.ttf", weight: "800", style: "normal" }
  ],
  variable: "--font-display",
  display: "swap"
});

const sans = localFont({
  src: [
    { path: "../public/fonts/Inter_18pt-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/Inter_18pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Inter_18pt-Medium.ttf", weight: "500", style: "normal" }
  ],
  variable: "--font-sans",
  display: "swap"
});

// Only Light (300) and Regular (400), both normal + italic — matches actual
// usage in the codebase (--font-serif-display is only used with font-light
// and font-normal).
const serifDisplay = localFont({
  src: [
    { path: "../public/fonts/NotoSerifDisplay-Light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/NotoSerifDisplay-LightItalic.ttf", weight: "300", style: "italic" },
    { path: "../public/fonts/NotoSerifDisplay-Regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoSerifDisplay-Italic.ttf", weight: "400", style: "italic" }
  ],
  variable: "--font-serif-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "THE LUXE VERSION — SHOWPIECES & LIGHT, REDEFINED.",
  description:
    "A house of decorative showpieces, lighting and mirrors — pieces conceived as compositions.",
  metadataBase: new URL("https://theluxeversion.example"),
  openGraph: {
    title: "THE LUXE VERSION",
    description: "Showpieces & light, redefined.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${serifDisplay.variable}`}>
      <body className="font-sans bg-ink text-chalk antialiased">
        <Preloader />
        <StoreProvider>
          <SmoothScroll>
            <ScrollTopOnRoute />
            <SiteChrome>{children}</SiteChrome>
          </SmoothScroll>
          <StoreMount />
        </StoreProvider>
      </body>
    </html>
  );
}
