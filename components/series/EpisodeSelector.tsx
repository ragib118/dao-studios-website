"use client";

import { useEffect, useMemo, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import { Series } from "@/data/series";

type Props = {
    series: Series;
    onEpisodeChange?: (episodeSlug: string) => void;
};

export default function EpisodeSelector({
    series,
    onEpisodeChange,
}: Props) {
    // Safely handle series that don't have seasons yet
    const seasons = Array.isArray(series.seasons)
        ? series.seasons
        : [];

    // If there are no seasons, don't crash the page
    if (seasons.length === 0) {
        return null;
    }

    const [selectedSeason, setSelectedSeason] = useState(
        String(seasons[0].number)
    );

    const season = useMemo(
        () =>
            seasons.find(
                (s) =>
                    String(s.number) === selectedSeason
            ) ?? seasons[0],
        [seasons, selectedSeason]
    );

    const [selectedEpisode, setSelectedEpisode] = useState(
        season?.episodes?.[0]?.slug ?? ""
    );

    // Keep the selector synchronized when the series changes
    useEffect(() => {
        const firstSeason = seasons[0];

        if (!firstSeason) {
            return;
        }

        setSelectedSeason(String(firstSeason.number));

        setSelectedEpisode(
            firstSeason.episodes?.[0]?.slug ?? ""
        );
    }, [series, seasons]);

    // If the selected season has no episodes, don't crash
    if (!season || !Array.isArray(season.episodes)) {
        return null;
    }

    const changeEpisode = (episodeSlug: string) => {
        setSelectedEpisode(episodeSlug);

        onEpisodeChange?.(episodeSlug);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "12px",
            }}
        >
            <Dropdown
                label="Season"
                value={selectedSeason}
                options={seasons.map((season) => ({
                    value: String(season.number),
                    label: season.title,
                }))}
                onChange={(value) => {
                    setSelectedSeason(value);

                    const newSeason = seasons.find(
                        (season) =>
                            String(season.number) === value
                    );

                    if (newSeason) {
                        const firstEpisode =
                            newSeason.episodes?.[0];

                        if (firstEpisode) {
                            changeEpisode(
                                firstEpisode.slug
                            );
                        } else {
                            setSelectedEpisode("");
                        }
                    }
                }}
            />

            {season.episodes.length > 0 && (
                <Dropdown
                    label="Episode"
                    value={selectedEpisode}
                    options={season.episodes.map(
                        (episode) => ({
                            value: episode.slug,
                            label: `Episode ${episode.number} • ${episode.title}`,
                        })
                    )}
                    onChange={changeEpisode}
                />
            )}
        </div>
    );
}