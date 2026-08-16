"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export let lenis: Lenis | null = null;

export default function SmoothScroll() {

    const pathname = usePathname();

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

    // Always start a newly opened route at the top.
    useEffect(() => {
        if (!lenis) return;

        lenis.scrollTo(0, {
            immediate: true,
        });
    }, [pathname]);

    // Home is already the current route on the homepage, so Next.js has
    // nothing to navigate to. Make the Home button still respond by
    // smoothly returning to the top instead of appearing unresponsive.
    useEffect(() => {
        const handleHomeClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            const homeLink = target?.closest('a[href="/"]');

            if (!homeLink || pathname !== "/") return;

            event.preventDefault();
            event.stopPropagation();

            lenis?.scrollTo(0, {
                duration: 0.9,
            });
        };

        document.addEventListener("click", handleHomeClick, true);

        return () => {
            document.removeEventListener("click", handleHomeClick, true);
        };
    }, [pathname]);

    return null;
}
