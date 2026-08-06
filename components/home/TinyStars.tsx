"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const STAR_ICONS = [
    "/icons/star-1.svg",
    "/icons/star-2.svg",
    "/icons/star-3.svg",
    "/icons/star-4.svg",
    "/icons/star-5.svg",
];

const TINY_STARS = [
    { left: 9, top: 58, size: 7, icon: 0 },
    { left: 15, top: 63, size: 7, icon: 1 },
    { left: 20, top: 56, size: 6, icon: 2 },
    { left: 26, top: 66, size: 7, icon: 3 },
    { left: 32, top: 58, size: 6, icon: 4 },
    { left: 38, top: 69, size: 7, icon: 0 },
    { left: 44, top: 60, size: 6, icon: 1 },
    { left: 50, top: 66, size: 7, icon: 2 },
    { left: 56, top: 60, size: 6, icon: 3 },
    { left: 62, top: 69, size: 7, icon: 4 },
    { left: 68, top: 58, size: 6, icon: 0 },
    { left: 74, top: 66, size: 7, icon: 1 },
    { left: 80, top: 60, size: 6, icon: 2 },
    { left: 86, top: 67, size: 7, icon: 3 },
    { left: 92, top: 59, size: 6, icon: 4 },

    // Bottom accents
    { left: 28, top: 78, size: 7, icon: 1 },
    { left: 50, top: 82, size: 8, icon: 2 },
    { left: 72, top: 78, size: 7, icon: 3 },
    { left: 86, top: 74, size: 7, icon: 4 },
    { left: 14, top: 76, size: 6, icon: 0 },
];

export default function TinyStars() {
    return (
        <>
            {TINY_STARS.map((star, index) => (
                <div
                    key={index}
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
                        animate={{
                            opacity: [0.25, 0.75, 0.25],
                            filter: [
                                "brightness(1)",
                                "brightness(2.2) drop-shadow(0 0 6px rgba(255,255,255,.55))",
                                "brightness(1)",
                            ],
                        }}
                        transition={{
                            duration: 1.8 + Math.random() * 1.5,
                            delay: Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut",
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