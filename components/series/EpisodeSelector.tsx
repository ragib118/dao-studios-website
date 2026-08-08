"use client";

import { useMemo, useState } from "react";
import Dropdown from "@/components/ui/Dropdown";
import { Series } from "@/data/series";

type Props = {
    series: Series;
};

export default function EpisodeSelector({
    series,
}: Props) {

    const [selectedSeason, setSelectedSeason] = useState(
        String(series.seasons[0].number)
    );

    const season = useMemo(
        () =>
            series.seasons.find(
                s => String(s.number) === selectedSeason
            ) ?? series.seasons[0],
        [series, selectedSeason]
    );

    const [selectedEpisode, setSelectedEpisode] = useState(
        season.episodes[0].slug
    );

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
                options={series.seasons.map(season => ({
                    value: String(season.number),
                    label: season.title,
                }))}
                onChange={(value) => {
                    setSelectedSeason(value);

                    const newSeason =
                        series.seasons.find(
                            season =>
                                String(season.number) === value
                        );

                    if (newSeason) {
                        setSelectedEpisode(
                            newSeason.episodes[0].slug
                        );
                    }
                }}
            />

            <Dropdown
                label="Episode"
                value={selectedEpisode}
                options={season.episodes.map(episode => ({
                    value: episode.slug,
                    label: `Episode ${episode.number} • ${episode.title}`,
                }))}
                onChange={setSelectedEpisode}
            />

        </div>

    );

}