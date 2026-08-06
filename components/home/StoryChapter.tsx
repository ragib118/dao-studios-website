"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { JourneyChapter } from "@/data/stats";

interface StoryChapterProps {
    chapter: JourneyChapter;
}

export default function StoryChapter({
    chapter,
}: StoryChapterProps) {

    return (

        <motion.div
            className={`storyBlock ${chapter.align}`}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            }}
        >

            <div className="backgroundWord">
                {chapter.backgroundWord}
            </div>

            <div className="storyContent">

                <div className="storyText">

                    <motion.div
                        className="goldLine"
                        initial={{
                            scaleX: 0,
                            opacity: 0,
                        }}
                        whileInView={{
                            scaleX: 1,
                            opacity: 1,
                        }}
                        viewport={{ once: true }}
                        transition={{
                            duration: 0.8,
                            delay: 0.2,
                        }}
                        style={{
                            transformOrigin:
                                chapter.align === "left"
                                    ? "left center"
                                    : "right center",
                        }}
                    />

                    <motion.span
                        className="chapter"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.25,
                            duration: 0.5,
                        }}
                    >
                        {chapter.chapter}
                    </motion.span>

                    <motion.h3
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.35,
                            duration: 0.6,
                        }}
                    >
                        {chapter.headline}
                    </motion.h3>

                    <motion.div
                        className="storyValue"
                        initial={{ opacity: 0, y: 35 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.45,
                            duration: 0.6,
                        }}
                    >
                        <AnimatedCounter value={chapter.value} />
                    </motion.div>

                    <motion.h4
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.55,
                            duration: 0.6,
                        }}
                    >
                        {chapter.title}
                    </motion.h4>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                            delay: 0.65,
                            duration: 0.6,
                        }}
                    >
                        {chapter.description}
                    </motion.p>

                </div>

            </div>

        </motion.div>

    );

}