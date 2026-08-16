import Link from "next/link";
import { motion } from "framer-motion";
import "@/styles/journey.css";

const milestones = [
    {
        year: "THE BEGINNING",
        title: "One idea became a studio.",
        text: "DAO Studios began with a simple ambition: create original stories, characters, and worlds that people could return to again and again. What started as an idea became a creative universe in the making.",
    },
    {
        year: "THE FIRST WORLDS",
        title: "Characters found a home.",
        text: "We started building our own worlds from the ground up — developing characters, visual identities, stories, and a creative language that could make every DAO Studios original feel unmistakably ours.",
    },
    {
        year: "THE DAOVERSE",
        title: "Our worlds began to connect.",
        text: "As more stories took shape, the vision grew beyond individual shorts. DAO Studios evolved toward a larger universe of original series, each with its own identity while sharing the same creative home.",
    },
    {
        year: "TODAY",
        title: "We are still building.",
        text: "DAO Studios is only at the beginning. Every new series, character, and story adds another piece to the universe — and the journey continues with every world we create.",
    },
];

export default function JourneyPage() {
    return (
        <main className="journeyPage">
            <section className="journeyHero">
                <div className="journeyGlow" />
                <div className="journeyHeroContent">
                    <span className="journeyEyebrow">THE DAO STUDIOS JOURNEY</span>
                    <h1>FROM ONE IDEA<br />TO MANY WORLDS.</h1>
                    <p>
                        Every studio has a beginning.<br />
                        This is ours.
                    </p>
                    <div className="journeyGoldLine" />
                </div>
            </section>

            <section className="journeyStory">
                <div className="journeyIntro">
                    <span>OUR STORY</span>
                    <h2>We didn't start with a universe.<br />We started with a vision.</h2>
                    <p>
                        DAO Studios exists to build original worlds from imagination —
                        stories that can grow, characters that can become iconic, and
                        universes that feel bigger than a single screen.
                    </p>
                </div>

                <div className="journeyTimeline">
                    {milestones.map((milestone, index) => (
                        <motion.article
                            className="journeyMilestone"
                            key={milestone.year}
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{ duration: 0.7, delay: index * 0.08 }}
                        >
                            <div className="journeyMarker">{String(index + 1).padStart(2, "0")}</div>
                            <div className="journeyMilestoneContent">
                                <span>{milestone.year}</span>
                                <h3>{milestone.title}</h3>
                                <p>{milestone.text}</p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </section>

            <section className="journeyFuture">
                <div>
                    <span>THE JOURNEY CONTINUES</span>
                    <h2>THIS IS ONLY<br />THE FIRST CHAPTER.</h2>
                    <p>More stories. More worlds. More imagination.</p>
                    <Link href="/" className="journeyBackButton">Back to DAO Studios</Link>
                </div>
            </section>
        </main>
    );
}
