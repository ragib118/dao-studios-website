import { notFound } from "next/navigation";

import { series } from "@/data/series";
import SeriesHero from "@/components/series/SeriesHero";
import AboutSeries from "@/components/series/AboutSeries";
import { createClient } from "@/lib/supabase/server";

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function SeriesPage({
    params,
}: Props) {
    const { slug } = await params;

    // Get the local series configuration.
    // This contains poster, hero, logo, description, genres, etc.
    const currentSeries = series.find(
        (item) => item.slug === slug
    );

    if (!currentSeries) {
        notFound();
    }

    // Connect to Supabase.
    const supabase = await createClient();

    // Find the series in the Supabase database.
    const { data: dbSeries, error: seriesError } =
        await supabase
            .from("series")
            .select("id, title, slug")
            .eq("slug", slug)
            .single();

    if (seriesError || !dbSeries) {
        console.error("Failed to load series from Supabase:", seriesError);
        notFound();
    }

    // Load published episodes for this series.
    const { data: dbEpisodes, error: episodesError } =
        await supabase
            .from("episodes")
            .select(
                `
                id,
                title,
                slug,
                description,
                season_number,
                episode_number,
                thumbnail_url,
                video_url,
                duration_seconds
                `
            )
            .eq("series_id", dbSeries.id)
            .eq("published", true)
            .order("season_number", { ascending: true })
            .order("episode_number", { ascending: true });

    if (episodesError) {
        console.error(
            "Failed to load episodes from Supabase:",
            episodesError
        );
        notFound();
    }

    // Convert Supabase episodes into the Episode/Season
    // structure already used by SeriesHero.
    const seasonsMap = new Map<
        number,
        {
            number: number;
            title: string;
            episodes: {
                number: number;
                title: string;
                slug: string;
                duration: string;
                description: string;
                thumbnail: string;
                video: string;
            }[];
        }
    >();

    for (const episode of dbEpisodes ?? []) {
        const seasonNumber = episode.season_number;

        if (!seasonsMap.has(seasonNumber)) {
            const localSeason = currentSeries.seasons.find(
                (season) => season.number === seasonNumber
            );

            seasonsMap.set(seasonNumber, {
                number: seasonNumber,
                title:
                    localSeason?.title ??
                    `Season ${seasonNumber}`,
                episodes: [],
            });
        }

        const localEpisode = currentSeries.seasons
            .flatMap((season) => season.episodes)
            .find(
                (localEpisode) =>
                    localEpisode.slug === episode.slug
            );

        seasonsMap.get(seasonNumber)!.episodes.push({
            number: episode.episode_number,
            title: episode.title,
            slug: episode.slug,
            duration:
                episode.duration_seconds != null
                    ? `${Math.ceil(
                          episode.duration_seconds / 60
                      )} min`
                    : localEpisode?.duration ?? "",
            description:
                episode.description ??
                localEpisode?.description ??
                "",
            thumbnail:
                episode.thumbnail_url ??
                localEpisode?.thumbnail ??
                "",
            video:
                episode.video_url ??
                localEpisode?.video ??
                "",
        });
    }

    // Supabase is now the source of truth for episodes.
    const seriesWithDatabaseEpisodes = {
        ...currentSeries,
        seasons: Array.from(seasonsMap.values()),
    };

    return (
        <main>
            <SeriesHero
                series={seriesWithDatabaseEpisodes}
            />

            <AboutSeries
                description={currentSeries.description}
                genres={currentSeries.genres}
                status={currentSeries.status}
            />
        </main>
    );
}