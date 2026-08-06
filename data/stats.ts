export interface JourneyChapter {
    id: number;
    chapter: string;
    backgroundWord: string;
    headline: string;
    value: string;
    title: string;
    description: string;
    align: "left" | "right";
}

export const journeyChapters: JourneyChapter[] = [
    {
        id: 1,
        chapter: "CHAPTER I",
        backgroundWord: "DREAM",
        headline: "Every Great Studio Starts With One Story",
        value: "1M+",
        title: "Views Across Our Stories",
        description:
            "Millions of viewers have stepped into the worlds created by DAO Studios, turning imagination into shared memories.",
        align: "right",
    },
    {
        id: 2,
        chapter: "CHAPTER II",
        backgroundWord: "UNIVERSE",
        headline: "New Worlds Come To Life",
        value: "4",
        title: "Original Universes",
        description:
            "Each series is built with its own identity, characters, emotions, and adventures that families can grow with.",
        align: "left",
    },
    {
        id: 3,
        chapter: "CHAPTER III",
        backgroundWord: "COMMUNITY",
        headline: "A Growing Family",
        value: "1K+",
        title: "Growing Community",
        description:
            "Our audience continues to grow every day as more people discover and share the worlds we create.",
        align: "right",
    },
    {
        id: 4,
        chapter: "FINAL CHAPTER",
        backgroundWord: "FOREVER",
        headline: "This Is Only The Beginning",
        value: "∞",
        title: "Stories Yet To Tell",
        description:
            "Every milestone is another beginning. The greatest adventures of DAO Studios are still waiting to be created.",
        align: "left",
    },
];