"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import { lenis } from "@/components/SmoothScroll";

export default function NavigationShell() {
    const pathname = usePathname();
    const [homeReset, setHomeReset] = useState(0);

    useEffect(() => {
        const handleHomeClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            const homeLink = target?.closest('a[href="/"]');

            if (!homeLink) return;

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
        };

        document.addEventListener("click", handleHomeClick, true);

        return () => {
            document.removeEventListener("click", handleHomeClick, true);
        };
    }, [pathname]);

    // Remount the header whenever the route changes OR Home is clicked.
    // This guarantees navigation state is always clean when returning Home.
    return <Header key={`${pathname}:${homeReset}`} />;
}
