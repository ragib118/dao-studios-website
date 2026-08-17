import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import "@/styles/dropdown.css";

import NavigationShell from "@/components/layout/NavigationShell";
import SmoothScroll from "@/components/SmoothScroll";

import "../styles/theme.css";
import "@/styles/hero.css";
import "@/styles/featured.css";
import "@/styles/stats.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://daostudios.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "DAO Studios",
    template: "%s | DAO Studios",
  },

  description:
    "DAO Studios creates original animated worlds, cinematic storytelling, unforgettable characters, and premium entertainment for audiences around the world.",

  keywords: [
    "DAO Studios",
    "Animation Studio",
    "Animated Stories",
    "Original Animation",
    "Kids Animation",
    "Family Entertainment",
    "Animated Series",
    "Puku",
    "Leo and Mochi",
    "My Giant Daddy",
    "Bubu Crab",
    "Cinematic Animation",
  ],

  authors: [
    {
      name: "DAO Studios",
      url: siteUrl,
    },
  ],

  creator: "DAO Studios",
  publisher: "DAO Studios",
  applicationName: "DAO Studios",
  category: "Entertainment",

  manifest: "/site.webmanifest",

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "DAO Studios",

    title: "DAO Studios",

    description:
      "Experience original animated worlds, unforgettable characters, and cinematic storytelling created by DAO Studios.",

    images: [
      {
        url: "/og-image.png",
        width: 1731,
        height: 909,
        alt: "DAO Studios | Original Animated Worlds & Stories",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "DAO Studios",

    description:
      "Original animated worlds, cinematic adventures, and unforgettable stories.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/favicon.ico",
        sizes: "any",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    name: "DAO Studios",

    url: siteUrl,

    logo: `${siteUrl}/logo.png`,

    image: `${siteUrl}/logo.png`,

    description:
      "DAO Studios creates original animated worlds, cinematic storytelling, unforgettable characters, and premium entertainment.",

    sameAs: [
      "https://www.youtube.com/@TheDaoStudios",
      "https://www.facebook.com/daostudios1",
      "https://www.instagram.com/daostudios1",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    name: "DAO Studios",

    alternateName: ["DAO", "daostudios.co"],

    url: `${siteUrl}/`,

    description:
      "Official website of DAO Studios featuring original animated worlds, stories, and cinematic entertainment.",

    publisher: {
      "@type": "Organization",
      name: "DAO Studios",
      url: `${siteUrl}/`,
    },
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              organizationSchema,
              websiteSchema,
            ]).replace(/</g, "\\u003c"),
          }}
        />

        <SmoothScroll />

        <NavigationShell />

        {children}
      </body>
    </html>
  );
}
