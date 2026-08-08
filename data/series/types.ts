export interface Episode {
    number: number;
    title: string;
    slug: string;
    duration: string;
    description: string;
    thumbnail: string;
    video: string;
}

export interface Season {
    number: number;
    title: string;
    episodes: Episode[];
}

export interface Series {
    title: string;
    slug: string;
    description: string;
    genres: string[];
    status: "Coming Soon" | "Now Streaming";

    assets: {
        poster: string;
        hero: string;
        logo: string;
    };

    trailer: string;

    seasons: Season[];
}