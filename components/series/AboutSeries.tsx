type AboutSeriesProps = {
    description: string;
    genres: string[];
    status: string;
};

export default function AboutSeries({
    description,
    genres,
    status,
}: AboutSeriesProps) {
    return (
        <section className="aboutSeries">

            <div className="aboutSeries__container">

                <div className="aboutSeries__header">
                    <span>ABOUT THE SERIES</span>
                    <h2>Discover the World</h2>
                </div>

                <p className="aboutSeries__description">
                    {description}
                </p>

                <div className="aboutSeries__meta">

                    <div className="aboutSeries__card">
                        <span className="label">
                            Genres
                        </span>

                        <p>
                            {genres.join(" • ")}
                        </p>
                    </div>

                    <div className="aboutSeries__card">
                        <span className="label">
                            Status
                        </span>

                        <p>{status}</p>
                    </div>

                </div>

            </div>

        </section>
    );
}