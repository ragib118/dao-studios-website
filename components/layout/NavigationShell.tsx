"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";

export default function NavigationShell() {
    const pathname = usePathname();

    // Remount the header whenever the route changes.
    // This guarantees search/series/profile/mobile overlays
    // cannot remain open after navigation to another page.
    return <Header key={pathname} />;
}
