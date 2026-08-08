import { Series } from "./types";

export const bubuCrab: Series = {
    title: "Bubu Crab",
    slug: "bubu-crab",

    description:
        "A tiny crab with a huge personality stumbles into hilarious adventures beneath the sea.",

    genres: [
        "Comedy",
        "Kids",
    ],

    status: "Coming Soon",

    assets: {
        poster: "/series/bubu-crab/poster.png",
        hero: "/series/bubu-crab/hero.png",
        logo: "/series/bubu-crab/logo.png",
    },

    trailer: "",

    seasons: [
        {
            number: 1,
            title: "Season 1",

            episodes: [
                {
                    number: 1,
                    title: "Bubble Trouble",
                    slug: "bubble-trouble",
                    duration: "4 min",

                    description:
                        "Bubu accidentally starts the funniest bubble adventure beneath the sea.",

                    thumbnail: "",
                    video: "",
                },
            ],
        },
    ],
};