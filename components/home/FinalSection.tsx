"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StarField from "./StarField";
import "@/styles/finalSection.css";

export default function FinalSection() {
    const [playMeteor, setPlayMeteor] = useState(false);

    return (
        <section id="journey" className="finalSection">
            <div className="finalGlow" />
            <StarField playMeteor={playMeteor} />

            <motion.div
                className="finalContent"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                onViewportEnter={() => {
                    window.setTimeout(() => setPlayMeteor(true), 1200);
                }}
                transition={{ duration: 1, ease: "easeOut" }}
            >
                <h2>
                    WE DON&apos;T JUST
                    <br />
                    TELL STORIES.
                    <br />
                    <br />
                    WE BUILD WORLDS.
                </h2>

                <p>
                    Every universe begins with a single idea.
                    <br />
                    This is where ours comes to life.
                </p>

                <div className="finalGoldLine" />
            </motion.div>
        </section>
    );
}
