import { Series } from "./types";

export const leoMochi: Series = {
    title: "Leo & Mochi",
    slug: "leo-mochi",

    description:
        "A heartwarming friendship between a little boy and a curious bunny creates unforgettable adventures.",

    genres: [
        "Family",
        "Adventure",
    ],

    status: "Coming Soon",

    assets: {
        poster: "/series/leo-mochi/poster.png",
        hero: "/series/leo-mochi/hero.png",
        logo: "/series/leo-mochi/logo.png",
    },

    trailer: "",

    seasons: [
        {
            number: 1,
            title: "Season 1",

            episodes: [
                {
                    number: 1,
                    title: "The First Adventure",
                    slug: "the-first-adventure",
                    duration: "4 min",

                    description:
                        "Leo meets Mochi and an unforgettable friendship begins.",

                    thumbnail: "",
                    video: "",
                },
            ],
        },
    ],
};