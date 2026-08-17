import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },

    sitemap: "https://www.daostudios.co/sitemap.xml",

    host: "https://www.daostudios.co",
  };
}
