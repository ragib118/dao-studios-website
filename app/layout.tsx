import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";

import "./globals.css";

import Header from "@/components/layout/Header";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://daostudios.co"),

  title: {
    default: "DAO Studios | Original Animated Worlds & Stories",
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
      url: "https://daostudios.co",
    },
  ],

  creator: "DAO Studios",
  publisher: "DAO Studios",

  applicationName: "DAO Studios",

  category: "Entertainment",

  alternates: {
    canonical: "/",
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
    url: "https://daostudios.co",
    siteName: "DAO Studios",

    title: "DAO Studios | Original Animated Worlds & Stories",

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

    title: "DAO Studios | Original Animated Worlds & Stories",

    description:
      "Original animated worlds, cinematic adventures, and unforgettable stories.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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

    url: "https://daostudios.co",

    logo: "https://daostudios.co/logo.png",

    description:
      "DAO Studios creates original animated worlds, cinematic storytelling, unforgettable characters, and premium entertainment.",

    sameAs: [
      "https://www.youtube.com/@TheDaoStudios",
      "https://www.facebook.com/daostudios1",
      "https://www.instagram.com/thedaostudios",
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <GoogleTagManager
          gtmId={process.env.NEXT_PUBLIC_GTM_ID!}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        <SmoothScroll />

        <Header />

        {children}

      </body>
    </html>
  );
}