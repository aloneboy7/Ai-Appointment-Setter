import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://ai-appointment-sette-vlfr5k.drytis.dev";

export const metadata: Metadata = {
  title: "AI Appointment Setter — Book Meetings on Autopilot",
  description:
    "Automate lead follow-ups, qualification, and appointment booking with AI chatbots, email automation, and smart scheduling. Book meetings while you sleep.",
  keywords: [
    "AI appointment setter",
    "AI lead follow-up",
    "AI sales automation",
    "automated appointment booking",
    "AI chatbot for businesses",
    "lead conversion automation",
    "AI scheduling",
    "automated follow-ups",
    "AI appointment booking",
  ],
  authors: [{ name: "AI Appointment Setter" }],
  creator: "AI Appointment Setter",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "AI Appointment Setter — Book Meetings on Autopilot",
    description:
      "AI chatbots, automated follow-ups, and smart scheduling that book meetings while you sleep.",
    siteName: "AI Appointment Setter",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Appointment Setter — Never Lose Leads Again",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Appointment Setter — Book Meetings on Autopilot",
    description:
      "AI chatbots, automated follow-ups, and smart scheduling that book meetings while you sleep.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'light') document.documentElement.classList.replace('dark', 'light');
              } catch(e) {}
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AI Appointment Setter",
              description:
                "AI-powered appointment booking and lead follow-up automation for businesses",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "AggregateOffer",
                lowPrice: "49",
                highPrice: "299",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                reviewCount: "127",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}