"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { journeyChapters } from "@/data/stats";
import StoryChapter from "./StoryChapter";

gsap.registerPlugin(ScrollTrigger);

export default function Stats() {

    const statsRef = useRef<HTMLElement>(null);

    const journeyRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll();

    const backgroundY = useTransform(
        scrollYProgress,
        [0, 1],
        [-120, 120]
    );

    useEffect(() => {

        if (!journeyRef.current) return;

        const ctx = gsap.context(() => {

            console.log("Journey Ready");

            /*
                Timeline will be added in Part 2.
            */

        }, journeyRef);

        return () => {

            ctx.revert();

        };

    }, []);

    return (

        <section
            ref={statsRef}
            className="stats"
        >

            <motion.div
                className="statsGlow"
                style={{ y: backgroundY }}
            />

            <div className="journeyIntro">

                <span>THE JOURNEY</span>

                <h2>
                    Every Great Story
                    <br />
                    Starts Somewhere
                </h2>

                <p>
                    Every milestone represents another step in our mission to
                    create unforgettable worlds for families around the globe.
                </p>

            </div>

            <div
                ref={journeyRef}
                className="journeyWrapper"
            >

                <div className="stickyStage">

                                     {journeyChapters.map((chapter) => (

                        <StoryChapter
                            key={chapter.id}
                            chapter={chapter}
                        />

                    ))}

                </div>

            </div>

        </section>

    );

}   