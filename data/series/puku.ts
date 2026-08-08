import { Series } from "./types";

export const puku: Series = {
    title: "PUKU",
    slug: "puku",

    description:
        "A brave panda and his friends embark on magical adventures filled with imagination, friendship and courage.",

    genres: [
        "Adventure",
        "Family",
        "Fantasy",
    ],

    status: "Coming Soon",

    assets: {
        poster: "/series/puku/poster.png",
        hero: "/series/puku/hero.png",
        logo: "/series/puku/logo.png",
    },

    trailer: "",

    seasons: [
        {
            number: 1,
            title: "Season 1",

            episodes: [
                {
                    number: 1,
                    title: "The Lost Bamboo",
                    slug: "the-lost-bamboo",
                    duration: "4 min",

                    description:
                        "Poko discovers a mysterious bamboo path that leads to an unforgettable adventure.",

                    thumbnail: "",
                    video: "",
                },

                {
                    number: 2,
                    title: "Forest Echo",
                    slug: "forest-echo",
                    duration: "5 min",

                    description:
                        "A strange echo deep inside the forest leads the friends somewhere unexpected.",

                    thumbnail: "",
                    video: "",
                },
            ],
        },
    ],
};