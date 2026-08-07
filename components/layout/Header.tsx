"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { navigation } from "@/data/navigation";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", onScroll);

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className={scrolled ? "header scrolled" : "header"}>

            <nav>

                <Link
                    href="/"
                    className="logo"
                    onClick={(event) => {
                        event.preventDefault();
                        setMenuOpen(false);
                        window.location.assign("/");
                    }}
                >
                    <Image
                        src="/logo.png"
                        alt="DAO Studios"
                        width={100}
                        height={70}
                        priority
                    />
                </Link>

                <ul className="desktopNav">
                    {navigation.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    className={`menuButton ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle Menu"
                >
                    <span />
                    <span />
                    <span />
                </button>

            </nav>

            <AnimatePresence>

                {menuOpen && (

                    <motion.div
                        className="mobileMenu"
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >

                       <div className="mobileMenuContent">

    <button
        className="closeButton"
        onClick={() => setMenuOpen(false)}
        aria-label="Close Menu"
    >
        ✕
    </button>

    <ul>

        {navigation.map((item) => (

            <li key={item.href}>

                <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                >
                    {item.label}
                </Link>

            </li>

        ))}

    </ul>

</div> 

                    </motion.div>

                )}

            </AnimatePresence>

        </header>
    );
}
