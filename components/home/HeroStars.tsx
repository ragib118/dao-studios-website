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

const HERO_STARS = [
    {
        id: "hero-1",
        left: 16,
        top: 42,
        size: 17,
        icon: 0,
    },
    {
        id: "hero-2",
        left: 32,
        top: 31,
        size: 18,
        icon: 1,
    },
    {
        id: "hero-3",
        left: 50,
        top: 38,
        size: 21,
        icon: 2,
    },
    {
        id: "hero-4",
        left: 69,
        top: 28,
        size: 18,
        icon: 3,
    },
    {
        id: "hero-5",
        left: 86,
        top: 44,
        size: 17,
        icon: 4,
    },
];

export default function HeroStars() {
    const [activeStar, setActiveStar] = useState("hero-3");

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        let previous = "hero-3";

        const sparkle = () => {
            let next = previous;

            while (next === previous) {
                next =
                    HERO_STARS[
                        Math.floor(Math.random() * HERO_STARS.length)
                    ].id;
            }

            previous = next;
            setActiveStar(next);

            timeout = setTimeout(
                sparkle,
                180 + Math.random() * 420
            );
        };

        sparkle();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            {HERO_STARS.map((star, index) => (
                <div
                    key={star.id}
                    className="starItem"
                    style={{
                        left: `${star.left}%`,
                        top: `${star.top}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        transform: `translate(-50%, -50%) rotate(${index * 14}deg)`,
                    }}
                >
                    <motion.div
                        animate={
                            activeStar === star.id
                                ? {
                                      opacity: [0.8, 1, 0.8],
                                      filter: [
                                          "brightness(1) drop-shadow(0 0 4px rgba(255,255,255,.35))",
                                          "brightness(2.8) drop-shadow(0 0 14px rgba(255,255,255,.95)) drop-shadow(0 0 30px rgba(214,179,106,.85))",
                                          "brightness(1) drop-shadow(0 0 4px rgba(255,255,255,.35))",
                                      ],
                                  }
                                : {
                                      opacity: 0.8,
                                      filter:
                                          "brightness(1) drop-shadow(0 0 4px rgba(255,255,255,.35))",
                                  }
                        }
                        transition={{
                            duration: 0.18,
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