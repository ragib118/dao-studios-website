"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export let lenis: Lenis | null = null;

export default function SmoothScroll() {

    useEffect(() => {

        lenis = new Lenis({

            duration: 1.2,

            smoothWheel: true,

            touchMultiplier: 1.5,

            // Prevent Lenis from handling scroll
            // inside dropdowns, modals, overlays, etc.
            prevent: (node) => {

                return !!node?.closest("[data-lenis-prevent]");

            },

        });

        function raf(time: number) {

            lenis?.raf(time);

            requestAnimationFrame(raf);

        }

        requestAnimationFrame(raf);

        return () => {

            lenis?.destroy();

            lenis = null;

        };

    }, []);

    return null;

}