import Link from "next/link";

type SeriesCardProps = {
    title: string;
    poster: string;
    slug: string;
};

export default function SeriesCard({
    title,
    poster,
    slug,
}: SeriesCardProps) {
    return (
        <Link
            href={`/series/${slug}`}
            style={{
                textDecoration: "none",
                color: "inherit",
            }}
        >
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
        </Link>
    );
}