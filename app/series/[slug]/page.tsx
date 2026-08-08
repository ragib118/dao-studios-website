import { notFound } from "next/navigation";

import { series } from "@/data/series";
import SeriesHero from "@/components/series/SeriesHero";
import AboutSeries from "@/components/series/AboutSeries";

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function SeriesPage({
    params,
}: Props) {

    const { slug } = await params;

    const currentSeries = series.find(
        (item) => item.slug === slug
    );

    if (!currentSeries) {
        notFound();
    }

    return (
        <main>
            
            <SeriesHero series={currentSeries} />
            
            <AboutSeries
                description={currentSeries.description}
                genres={currentSeries.genres}
                status={currentSeries.status}
            />
        
        </main>
    );
}