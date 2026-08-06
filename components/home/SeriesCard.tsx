type SeriesCardProps = {
    title: string;
    poster: string;
};

export default function SeriesCard({
    title,
    poster,
}: SeriesCardProps) {
    return (
        <article
            className="seriesCard"
            aria-label={title}
        >
            <img
                src={poster}
                alt={title}
                className="seriesPoster"
                draggable={false}
                loading="lazy"
                decoding="async"
            />

            <div className="seriesOverlay">
                <div className="seriesContent">
                    <h3>{title}</h3>

                    <button
                        type="button"
                        aria-label={`Watch ${title}`}
                    >
                        ▶ Watch Now
                    </button>
                </div>
            </div>
        </article>
    );
}