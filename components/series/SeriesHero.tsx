import { Series } from "@/data/series";
import EpisodeSelector from "./EpisodeSelector";

type Props = {
    series: Series;
};

export default function SeriesHero({
    series,
}: Props) {
    return (
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

                        <button className="watchButton">
                            ▶ Watch Episode
                        </button>

                        <button className="trailerButton">
                            ▶ Watch Trailer
                        </button>

                    </div>

                    <EpisodeSelector
                        series={series}
                    />

                </div>

            </div>

        </section>
    );
}