"use client";

import { useEffect } from "react";
import { lenis } from "@/components/SmoothScroll";

export default function useScrollLock(
    locked: boolean
) {
    useEffect(() => {
        if (!locked) return;

        const html = document.documentElement;
        const body = document.body;

        const scrollY = window.scrollY;

        const previousHtmlOverflow = html.style.overflow;
        const previousBodyOverflow = body.style.overflow;
        const previousBodyPosition = body.style.position;
        const previousBodyTop = body.style.top;
        const previousBodyWidth = body.style.width;

        lenis?.stop();

        html.style.overflow = "hidden";

        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.width = "100%";

        return () => {

            html.style.overflow = previousHtmlOverflow;

            body.style.overflow = previousBodyOverflow;
            body.style.position = previousBodyPosition;
            body.style.top = previousBodyTop;
            body.style.width = previousBodyWidth;

            window.scrollTo({
                top: scrollY,
                behavior: "instant",
            });

            lenis?.start();

        };

    }, [locked]);
}