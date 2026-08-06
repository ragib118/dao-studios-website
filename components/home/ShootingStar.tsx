"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type Props = {
    play: boolean;
};

export default function ShootingStar({ play }: Props) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                x: -300,
                y: 0,
            }}
            animate={
                play
                    ? {
                          opacity: [0, 1, 1, 0],
                          x: 1400,
                          y: 70,
                      }
                    : {}
            }
            transition={{
                duration: 2,
                ease: "easeInOut",
            }}
            style={{
                position: "absolute",
                left: "0%",
                top: "18%",
                width: 320,
                height: 24,
                rotate: "7deg",
                pointerEvents: "none",
                zIndex: 100,
            }}
        >
            {/* Tail */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 290,
                    height: 2,
                    borderRadius: 999,
                    background:
                        "linear-gradient(90deg, transparent 0%, rgba(198,164,92,.15) 25%, rgba(255,248,210,.7) 70%, #fff 100%)",
                    filter: "blur(.8px)",
                }}
            />

            {/* Glow */}
            <div
                style={{
                    position: "absolute",
                    right: -6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(255,255,255,.95) 0%, rgba(255,248,210,.75) 45%, rgba(198,164,92,.4) 75%, transparent 100%)",
                    filter: "blur(8px)",
                }}
            />

            {/* Star */}
            <motion.div
                animate={
                    play
                        ? {
                              scale: [1, 1.15, 1],
                              rotate: [0, 15, 0],
                          }
                        : {}
                }
                transition={{
                    duration: 0.35,
                    repeat: Infinity,
                }}
                style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    filter:
                        "drop-shadow(0 0 10px white) drop-shadow(0 0 25px rgba(198,164,92,.95))",
                }}
            >
                <Image
                    src="/icons/star-4.svg"
                    alt=""
                    width={24}
                    height={24}
                    draggable={false}
                />
            </motion.div>
        </motion.div>
    );
}