import type { Metadata, Viewport } from "next";
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/erp/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "CMSys — SLN Logistics · Trincomalee",
    template: "%s · CMSys",
  },
  description:
    "CMSys — the Civil Engineering Management System for SLN Logistics, Trincomalee. Vote allocations, procurement, stores, rate contracts and daily collection in one command deck.",
  applicationName: "CMSys",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/icon.svg", type: "image/svg+xml" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/brand/icon-512.png",
  },
  metadataBase: new URL("https://cmsys.sln-logistics.lk"),
  openGraph: {
    title: "CMSys — SLN Logistics · Trincomalee",
    description:
      "Command deck for naval logistics: vote allocations, procurement, stores, rate contracts and collection.",
    images: ["/brand/og.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#040a15",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
