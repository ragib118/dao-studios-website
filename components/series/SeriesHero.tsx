"use client";

import { useState } from "react";

import { Series } from "@/data/series";

import EpisodeSelector from "./EpisodeSelector";
import VideoPlayer from "@/components/video/VideoPlayer";

type Props = {
    series: Series;
};

export default function SeriesHero({
    series,
}: Props) {
    const firstEpisode =
        series.seasons[0]?.episodes[0];

    const [selectedEpisodeSlug, setSelectedEpisodeSlug] =
        useState(
            firstEpisode?.slug ?? ""
        );

    const [isPlayerOpen, setIsPlayerOpen] =
        useState(false);

    const selectedEpisode =
        series.seasons
            .flatMap(
                (season) => season.episodes
            )
            .find(
                (episode) =>
                    episode.slug ===
                    selectedEpisodeSlug
            );

    const handleWatchEpisode = () => {
        if (!selectedEpisode?.video) {
            return;
        }

        setIsPlayerOpen(true);
    };

    return (
        <>
            <section className="seriesHero">
                <div
                    className="seriesHero__background"
                    style={{
                        backgroundImage: `url(${series.assets.poster})`,
                    }}
                >
                    <div className="seriesHero__gradient" />
                </div>

                <div className="seriesHero__container">
                    <div className="seriesHero__poster">
                        <img
                            src={series.assets.poster}
                            alt={series.title}
                        />
                    </div>

                    <div className="seriesHero__content">
                        <h1 className="seriesHero__title">
                            {series.title}
                        </h1>

                        <div className="seriesHero__genres">
                            {series.genres.join(" • ")}
                        </div>

                        <div className="seriesHero__actions">
                            <button
                                className="watchButton"
                                type="button"
                                onClick={
                                    handleWatchEpisode
                                }
                                disabled={
                                    !selectedEpisode?.video
                                }
                            >
                                ▶ Watch Episode
                            </button>
                        </div>

                        <EpisodeSelector
                            series={series}
                            onEpisodeChange={
                                setSelectedEpisodeSlug
                            }
                        />
                    </div>
                </div>
            </section>

            {isPlayerOpen &&
                selectedEpisode?.video && (
                <VideoPlayer
                    src={selectedEpisode.video}
                    title={`${series.title} • Episode ${selectedEpisode.number} • ${selectedEpisode.title}`}
                    onClose={() => setIsPlayerOpen(false)}
                />
                )}
        </>
    );
}
