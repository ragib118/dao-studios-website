import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DAO Studios",
    short_name: "DAO Studios",

    description:
      "Original animated worlds, cinematic storytelling, unforgettable characters, and premium entertainment.",

    start_url: "/",

    display: "standalone",

    background_color: "#000000",

    theme_color: "#000000",

    orientation: "portrait",

    lang: "en",

    categories: ["entertainment", "animation", "streaming"],

    icons: [
      {
        src: "/logo.png",
        sizes: "2048x2048",
        type: "image/png",
      },
    ],
  };
}