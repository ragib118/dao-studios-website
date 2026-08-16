"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export let lenis: Lenis | null = null;

export default function SmoothScroll() {

    useEffect(() => {

        lenis = new Lenis({
            duration: 0.9,
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.2,
            easing: (t) => 1 - Math.pow(1 - t, 3),

            prevent: (node) => {
                return !!node?.closest("[data-lenis-prevent]");
            },
        });

        let animationFrame: number;

        const raf = (time: number) => {
            lenis?.raf(time);
            animationFrame = requestAnimationFrame(raf);
        };

        animationFrame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationFrame);
            lenis?.destroy();
            lenis = null;
        };

    }, []);

    return null;
}
