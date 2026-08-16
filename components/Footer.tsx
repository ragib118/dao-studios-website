"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import "@/styles/footer.css";

export default function Footer() {
    return (
        <footer className="footer">

            <motion.div
                className="footerContainer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >

                <div className="footerLogo">
                    DAO STUDIOS
                </div>

                <p className="footerTagline">
                    Creating worlds that inspire.
                    <br />
                    One story at a time.
                </p>

                <nav className="footerNav">

                    <Link href="/">Home</Link>

                    <Link href="/#discover-worlds">Originals</Link>

                    <Link href="/#journey">Journey</Link>

                </nav>

                <div className="footerSocial">

                    <a
                        href="https://www.instagram.com/thedaostudios"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Instagram
                    </a>

                    <a
                        href="https://www.youtube.com/@TheDaoStudios"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        YouTube
                    </a>

                    <a
                        href="https://www.facebook.com/daostudios1"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Facebook
                    </a>

                </div>

                <div className="footerBottom">

                    © 2026 DAO Studios. All Rights Reserved.

                </div>

            </motion.div>

        </footer>
    );
}