"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function NavigationShell() {
    const pathname = usePathname();
    const [homeReset, setHomeReset] = useState(0);

    useEffect(() => {
        const handleHomeClick = (event: MouseEvent) => {
            const target = event.target as Element | null;
            const homeLink = target?.closest('a[href="/"]');

            if (!homeLink) return;

            // Force the Header to remount even when the user is already on
            // the homepage. This closes any open Search/Series/Profile/
            // Mobile overlay before Home returns the user to the top.
            setHomeReset((value) => value + 1);
        };

        document.addEventListener("click", handleHomeClick, true);

        return () => {
            document.removeEventListener("click", handleHomeClick, true);
        };
    }, []);

    // Remount the header whenever the route changes OR Home is clicked.
    // This guarantees navigation state is always clean when returning Home.
    return <Header key={`${pathname}:${homeReset}`} />;
}
