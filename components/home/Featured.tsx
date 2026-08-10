"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import SeriesCard from "./SeriesCard";
import { series } from "@/data/series";

export default function Featured() {
    const sliderRef = useRef<HTMLDivElement | null>(null);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        const slider = sliderRef.current;

        if (!slider) return;

        const handleWheel = (e: WheelEvent) => {
            // Ignore horizontal scrolling (trackpads)
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

            const atStart = slider.scrollLeft <= 0;
            const atEnd =
                slider.scrollLeft + slider.clientWidth >=
                slider.scrollWidth - 1;

            // Let the page scroll when we've reached either end
            if (
                (e.deltaY < 0 && atStart) ||
                (e.deltaY > 0 && atEnd)
            ) {
                return;
            }

            e.preventDefault();
            slider.scrollLeft += e.deltaY;
        };

        slider.addEventListener("wheel", handleWheel, {
            passive: false,
        });

        return () => {
            slider.removeEventListener("wheel", handleWheel);
        };
    }, []);

    useEffect(() => {
        const stopDragging = () => {
            if (!sliderRef.current) return;

            isDragging.current = false;
            sliderRef.current.classList.remove("dragging");
        };

        window.addEventListener("mouseup", stopDragging);

        return () => {
            window.removeEventListener("mouseup", stopDragging);
        };
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (!sliderRef.current) return;

        const amount = sliderRef.current.clientWidth * 0.8;

        sliderRef.current.scrollBy({
            left: direction === "right" ? amount : -amount,
            behavior: "smooth",
        });
    };

    const handleMouseDown = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (!sliderRef.current) return;

        isDragging.current = true;
        sliderRef.current.classList.add("dragging");

        startX.current =
            e.pageX - sliderRef.current.offsetLeft;

        scrollLeft.current =
            sliderRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        if (!sliderRef.current) return;

        isDragging.current = false;
        sliderRef.current.classList.remove("dragging");
    };

    const handleMouseUp = () => {
        if (!sliderRef.current) return;

        isDragging.current = false;
        sliderRef.current.classList.remove("dragging");
    };

    const handleMouseMove = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        if (!isDragging.current || !sliderRef.current) return;

        e.preventDefault();

        const slider = sliderRef.current;

        const x =
            e.pageX - slider.offsetLeft;

        const walk =
            (x - startX.current) * 1.5;

        slider.scrollLeft =
            scrollLeft.current - walk;
    };

    return (
        <section
            id="discover-worlds"
            className="featured"
        >
            <div className="featuredContainer">

                <div className="sectionHeader">

                    <div>
                        <h2>Discover Our Worlds</h2>

                        <p>
                            Every world tells a different story.
                            Explore adventures created exclusively
                            by DAO Studios.
                        </p>
                    </div>

                    <Link href="/series">
                        Explore All →
                    </Link>

                </div>

                <div className="carouselWrapper">

                    <button
                        className="carouselButton left"
                        onClick={() => scroll("left")}
                        aria-label="Previous"
                    >
                        ❮
                    </button>

                    <div
                        ref={sliderRef}
                        className="featuredCarousel"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                    >
                        {series.map((item) => (
                            <SeriesCard
                                key={item.slug}
                                title={item.title}
                                poster={item.assets.poster}
                                slug={item.slug}
                            />
                        ))}
                    </div>

                    <button
                        className="carouselButton right"
                        onClick={() => scroll("right")}
                        aria-label="Next"
                    >
                        ❯
                    </button>

                </div>

            </div>
        </section>
    );
}