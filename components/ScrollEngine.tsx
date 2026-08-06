"use client";

import { useEffect, useRef } from "react";

export default function ScrollEngine() {

    const lastDirection = useRef<"up" | "down" | null>(null);

    useEffect(() => {

        function onWheel(e: WheelEvent) {

            if (e.deltaY > 0) {

                if (lastDirection.current !== "down") {

                    console.log("↓ DOWN");

                    lastDirection.current = "down";

                }

            } else {

                if (lastDirection.current !== "up") {

                    console.log("↑ UP");

                    lastDirection.current = "up";

                }

            }

        }

        window.addEventListener("wheel", onWheel, {
            passive: true,
        });

        return () => {

            window.removeEventListener("wheel", onWheel);

        };

    }, []);

    return null;

}