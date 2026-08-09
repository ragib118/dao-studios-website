"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

import { navigation } from "@/data/navigation";
import SearchOverlay from "@/components/layout/SearchOverlay";
import SeriesOverlay from "@/components/layout/SeriesOverlay";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [seriesOpen, setSeriesOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const searchButtonRef = useRef<HTMLButtonElement>(null);
    const seriesButtonRef = useRef<HTMLButtonElement>(null);

    const toggleSearch = () => {
        setSearchOpen((isOpen) => !isOpen);
        setSeriesOpen(false);
    };

    const toggleSeries = () => {
        setSeriesOpen((isOpen) => !isOpen);
        setSearchOpen(false);
    };

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            setUser(user);
        };

        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();

        setUser(null);
        setMenuOpen(false);

        window.location.assign("/");
    };

    return (
        <>
            <header className={scrolled ? "header scrolled" : "header"}>
                <nav>
                    {/* LOGO */}
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

                    {/* DESKTOP NAVIGATION */}
                    <ul className="desktopNav">
                        {navigation.map((item) => (
                            <li key={item.href}>
                                {item.href === "/series" ? (
                                    <button
                                        ref={seriesButtonRef}
                                        type="button"
                                        aria-controls="series-overlay-dialog"
                                        aria-expanded={seriesOpen}
                                        onClick={toggleSeries}
                                    >
                                        {item.label}
                                    </button>
                                ) : item.href === "/search" ? (
                                    <button
                                        ref={searchButtonRef}
                                        type="button"
                                        aria-controls="site-search-dialog"
                                        aria-expanded={searchOpen}
                                        onClick={toggleSearch}
                                    >
                                        {item.label}
                                    </button>
                                ) : (
                                    <Link href={item.href}>
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}

                        {/* ACCOUNT / SIGN IN */}
                        <li className="authNavItem">
                            {user ? (
                                <Link
                                    href="/account"
                                    onClick={() => {
                                        setMenuOpen(false);
                                    }}
                                >
                                    Account
                                </Link>
                            ) : (
                                <Link href="/login">
                                    Sign In
                                </Link>
                            )}
                        </li>
                    </ul>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        className={`menuButton ${
                            menuOpen ? "open" : ""
                        }`}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                        aria-expanded={menuOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </nav>

                {/* MOBILE MENU */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            className="mobileMenu"
                            initial={{
                                opacity: 0,
                                x: "100%",
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            exit={{
                                opacity: 0,
                                x: "100%",
                            }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div className="mobileMenuContent">
                                <button
                                    className="closeButton"
                                    onClick={() =>
                                        setMenuOpen(false)
                                    }
                                    aria-label="Close Menu"
                                >
                                    ✕
                                </button>

                                <ul>
                                    {navigation.map((item) => (
                                        <li key={item.href}>
                                            {item.href === "/series" ? (
                                                <button
                                                    ref={
                                                        seriesButtonRef
                                                    }
                                                    type="button"
                                                    aria-controls="series-overlay-dialog"
                                                    aria-expanded={
                                                        seriesOpen
                                                    }
                                                    onClick={
                                                        toggleSeries
                                                    }
                                                >
                                                    {item.label}
                                                </button>
                                            ) : item.href === "/search" ? (
                                                <button
                                                    ref={
                                                        searchButtonRef
                                                    }
                                                    type="button"
                                                    aria-controls="site-search-dialog"
                                                    aria-expanded={
                                                        searchOpen
                                                    }
                                                    onClick={
                                                        toggleSearch
                                                    }
                                                >
                                                    {item.label}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={() =>
                                                        setMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    {item.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}

                                    {/* MOBILE ACCOUNT */}
                                    <li>
                                        {user ? (
                                            <>
                                                <Link
                                                    href="/account"
                                                    onClick={() =>
                                                        setMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Account
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleSignOut
                                                    }
                                                >
                                                    Sign Out
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                href="/login"
                                                onClick={() =>
                                                    setMenuOpen(
                                                        false
                                                    )
                                                }
                                            >
                                                Sign In
                                            </Link>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* SEARCH OVERLAY */}
            <SearchOverlay
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
                triggerRef={searchButtonRef}
            />

            {/* SERIES OVERLAY */}
            <SeriesOverlay
                isOpen={seriesOpen}
                onClose={() => setSeriesOpen(false)}
                triggerRef={seriesButtonRef}
            />
        </>
    );
}