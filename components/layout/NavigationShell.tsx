"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import { lenis } from "@/components/SmoothScroll";

export default function NavigationShell() {
    const pathname = usePathname();
    const [homeReset, setHomeReset] = useState(0);

    useEffect(() => {
        const handleNavigationClick = (event: MouseEvent) => {
            const target = event.target as Element | null;

            if (!target) return;

            const homeLink = target.closest('a[href="/"]');

            if (homeLink) {
                // When Home is already the current route, prevent the browser
                // from keeping the previous scroll position. Close any open
                // navigation overlay and always return to the very top.
                if (pathname === "/") {
                    event.preventDefault();
                    event.stopPropagation();

                    setHomeReset((value) => value + 1);

                    requestAnimationFrame(() => {
                        lenis?.scrollTo(0, {
                            duration: 0.9,
                        });
                    });
                } else {
                    // On another route, still remount the Header immediately so
                    // any open overlay is cleared while the route changes.
                    setHomeReset((value) => value + 1);
                }

                return;
            }

            // On mobile, Series and Search are buttons because they open
            // overlays instead of changing routes. Close the full-screen
            // hamburger menu after the button action has opened its overlay.
            // This keeps the overlay visible instead of leaving the mobile
            // navigation sitting on top of it.
            const mobileOverlayButton = target.closest(
                '.mobileMenu button[aria-controls="series-overlay-dialog"], .mobileMenu button[aria-controls="site-search-dialog"]'
            );

            if (
                mobileOverlayButton &&
                window.matchMedia("(max-width: 900px)").matches
            ) {
                requestAnimationFrame(() => {
                    const closeButton = document.querySelector(
                        ".mobileMenu .closeButton"
                    ) as HTMLButtonElement | null;

                    closeButton?.click();
                });
            }
        };

        document.addEventListener(
            "click",
            handleNavigationClick,
            true
        );

        return () => {
            document.removeEventListener(
                "click",
                handleNavigationClick,
                true
            );
        };
    }, [pathname]);

    // Remount the header whenever the route changes OR Home is clicked.
    // This guarantees navigation state is always clean when returning Home.
    return <Header key={`${pathname}:${homeReset}`} />;
}
