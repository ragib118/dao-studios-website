import { Series } from "./types";

export const myGiantDaddy: Series = {
    title: "My Giant Daddy",
    slug: "my-giant-daddy",

    description:
        "Life becomes extraordinary when a giant-hearted father turns everyday moments into unforgettable memories.",

    genres: [
        "Comedy",
        "Family",
    ],

    status: "Now Streaming",

    assets: {
        poster: "/series/my-giant-daddy/poster.png",
        hero: "/series/my-giant-daddy/hero.png",
        logo: "/series/my-giant-daddy/logo.png",
    },

    trailer: "",

    seasons: [
        {
            number: 1,
            title: "Season 1",

            episodes: [
                {
                    number: 1,
                    title: "A Giant Surprise",
                    slug: "a-giant-surprise",
                    duration: "4 min",

                    description:
                        "A normal day becomes extraordinary thanks to Giant Daddy.",

                    thumbnail: "",
                    video: "",
                },
            ],
        },
    ],
};