"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const STAR_ICONS = [
    "/icons/star-1.svg",
    "/icons/star-2.svg",
    "/icons/star-3.svg",
    "/icons/star-4.svg",
    "/icons/star-5.svg",
];

const MEDIUM_STARS = [
    { id: "m1", left: 12, top: 47, size: 10, icon: 0 },
    { id: "m2", left: 23, top: 52, size: 10, icon: 1 },
    { id: "m3", left: 29, top: 43, size: 11, icon: 2 },
    { id: "m4", left: 40, top: 49, size: 10, icon: 3 },
    { id: "m5", left: 45, top: 38, size: 11, icon: 4 },
    { id: "m6", left: 56, top: 45, size: 10, icon: 0 },
    { id: "m7", left: 62, top: 54, size: 10, icon: 1 },
    { id: "m8", left: 72, top: 46, size: 10, icon: 2 },
    { id: "m9", left: 78, top: 52, size: 11, icon: 3 },
    { id: "m10", left: 89, top: 47, size: 10, icon: 4 },
];

export default function MediumStars() {
    const [activeStar, setActiveStar] = useState("m1");

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        let previous = "m1";

        const shimmer = () => {
            let next = previous;

            while (next === previous) {
                next =
                    MEDIUM_STARS[
                        Math.floor(Math.random() * MEDIUM_STARS.length)
                    ].id;
            }

            previous = next;
            setActiveStar(next);

            timeout = setTimeout(
                shimmer,
                300
            );
        };

        shimmer();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {MEDIUM_STARS.map((star) => (
                <div
                    key={star.id}
                    className="starItem"
                    style={{
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        transform: "translate(-50%, -50%)",
                    }}
                >
                    <motion.div
                        animate={
                            activeStar === star.id
                                ? {
                                      opacity: [0.35, 0.8, 0.35],
                                      filter: [
                                          "brightness(1)",
                                          "brightness(1.8) drop-shadow(0 0 10px rgba(255,255,255,.65)) drop-shadow(0 0 18px rgba(214,179,106,.35))",
                                          "brightness(1)",
                                      ],
                                  }
                                : {
                                      opacity: 0.35,
                                      filter: "brightness(1)",
                                  }
                        }
                        transition={{
                            duration: 0.16,
                            ease: "easeOut",
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                    >
                        <Image
                            src={STAR_ICONS[star.icon]}
                            alt=""
                            width={32}
                            height={32}
                            draggable={false}
                        />
                    </motion.div>
                </div>
            ))}
        </>
    );
}