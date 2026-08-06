"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
    value: string;
    duration?: number;
};

export default function AnimatedCounter({
    value,
    duration = 2,
}: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, {
        once: true,
        amount: 0.6,
    });

    const [display, setDisplay] = useState("0");

    useEffect(() => {
        if (!isInView) return;

        if (value === "∞") {
            setDisplay("∞");
            return;
        }

        const number = parseFloat(value.replace(/[^\d.]/g, ""));
        const suffix = value.replace(/[\d.]/g, "");

        const controls = animate(0, number, {
            duration,
            ease: "easeOut",
            onUpdate(latest) {
                const rounded =
                    number >= 100
                        ? Math.floor(latest)
                        : Number(latest.toFixed(1));

                setDisplay(`${rounded}${suffix}`);
            },
        });

        return () => controls.stop();
    }, [isInView, value, duration]);

    return <span ref={ref}>{display}</span>;
}