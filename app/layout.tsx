import type { Metadata } from "next";
import { Inter, Inter_Tight, Noto_Serif_Display } from "next/font/google";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { SiteChrome } from "@/components/site/site-chrome";
import { ScrollTopOnRoute } from "@/components/site/scroll-top-on-route";
import { Preloader } from "@/components/ui/preloader";
import { StoreProvider } from "@/components/store/store-provider";
import { StoreMount } from "@/components/store/store-mount";
import "./globals.css";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap"
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap"
});

// Trimmed from 5 weights × 2 styles (10 combinations) → 2 × 2 (4). Grep of
// the codebase shows `--font-serif-display` is only used with `font-light`
// (300) and `font-normal` (400), both normal and italic — the 500/600/700
// weights were loaded but never referenced. Fewer variants = fewer chances
// for `next/font` to choke on a flaky Google Fonts response during Vercel
// builds (which was crashing the deploy with
// `TypeError: Cannot read properties of null (reading '1')`).
const serifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
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
