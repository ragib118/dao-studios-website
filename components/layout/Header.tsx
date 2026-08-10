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

function getInitial(user: User) {
    const email = user.email || "";

    const nameFromMetadata =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

    const source = nameFromMetadata || email;

    return source.charAt(0).toUpperCase() || "U";
}

function getAvatarColor(user: User) {
    const value = user.email || user.id || "user";

    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash = value.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        "#E50914",
        "#2563EB",
        "#7C3AED",
        "#059669",
        "#D97706",
        "#DB2777",
        "#0891B2",
        "#65A30D",
    ];

    return colors[Math.abs(hash) % colors.length];
}

function getDisplayName(user: User) {
    const metadataName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name;

    if (metadataName) {
        return metadataName;
    }

    const email = user.email || "";

    const username = email.split("@")[0];

    const words = username
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean);

    return words
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [seriesOpen, setSeriesOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [user, setUser] = useState<User | null>(null);

    // ADMIN STATE
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminChecking, setAdminChecking] = useState(true);

    const searchButtonRef =
        useRef<HTMLButtonElement>(null);

    const seriesButtonRef =
        useRef<HTMLButtonElement>(null);

    const profileRef =
        useRef<HTMLLIElement>(null);

    const toggleSearch = () => {
        setSearchOpen((isOpen) => !isOpen);
        setSeriesOpen(false);
        setProfileOpen(false);
    };

    const toggleSeries = () => {
        setSeriesOpen((isOpen) => !isOpen);
        setSearchOpen(false);
        setProfileOpen(false);
    };

    const toggleProfile = () => {
        setProfileOpen((isOpen) => !isOpen);
        setSearchOpen(false);
        setSeriesOpen(false);
    };

    // ---------------------------------------
    // AUTH + ADMIN CHECK
    // ---------------------------------------

    useEffect(() => {
        let mounted = true;

        const checkUserAndAdmin = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!mounted) return;

                setUser(user);

                // Logged out = definitely not admin
                if (!user) {
                    setIsAdmin(false);
                    setAdminChecking(false);
                    return;
                }

                // Check the secure Supabase is_admin() function
                const {
                    data: adminResult,
                    error: adminError,
                } = await supabase.rpc("is_admin");

                if (!mounted) return;

                if (adminError) {
                    console.error(
                        "ADMIN CHECK ERROR:",
                        adminError
                    );

                    setIsAdmin(false);
                } else {
                    setIsAdmin(adminResult === true);
                }

                setAdminChecking(false);
            } catch (error) {
                console.error(
                    "AUTH / ADMIN CHECK FAILED:",
                    error
                );

                if (!mounted) return;

                setIsAdmin(false);
                setAdminChecking(false);
            }
        };

        checkUserAndAdmin();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (!mounted) return;

                const currentUser =
                    session?.user ?? null;

                setUser(currentUser);

                // Logged out
                if (!currentUser) {
                    setIsAdmin(false);
                    setAdminChecking(false);
                    return;
                }

                // Re-check admin status after login/logout
                try {
                    const {
                        data: adminResult,
                        error: adminError,
                    } = await supabase.rpc("is_admin");

                    if (!mounted) return;

                    if (adminError) {
                        console.error(
                            "ADMIN CHECK ERROR:",
                            adminError
                        );

                        setIsAdmin(false);
                    } else {
                        setIsAdmin(
                            adminResult === true
                        );
                    }
                } catch (error) {
                    console.error(
                        "ADMIN RPC FAILED:",
                        error
                    );

                    if (!mounted) return;

                    setIsAdmin(false);
                }

                setAdminChecking(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ---------------------------------------
    // SCROLL
    // ---------------------------------------

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener(
            "scroll",
            onScroll
        );

        return () => {
            window.removeEventListener(
                "scroll",
                onScroll
            );
        };
    }, []);

    // ---------------------------------------
    // CLOSE PROFILE WHEN CLICKING OUTSIDE
    // ---------------------------------------

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node
                )
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // ---------------------------------------
    // SIGN OUT
    // ---------------------------------------

    const handleSignOut = async () => {
        await supabase.auth.signOut();

        setUser(null);
        setIsAdmin(false);
        setProfileOpen(false);
        setMenuOpen(false);

        window.location.assign("/");
    };

    const displayName = user
        ? getDisplayName(user)
        : "";

    const initial = user
        ? getInitial(user)
        : "U";

    const avatarColor = user
        ? getAvatarColor(user)
        : "#444444";

    return (
        <>
            <header
                className={
                    scrolled
                        ? "header scrolled profile-layer"
                        : "header profile-layer"
                }
            >
                <nav>
                    {/* --------------------------------------- */}
                    {/* LOGO */}
                    {/* --------------------------------------- */}

                    <Link
                        href="/"
                        className="logo"
                        onClick={(event) => {
                            event.preventDefault();

                            setMenuOpen(false);

                            window.location.assign(
                                "/"
                            );
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

                    {/* --------------------------------------- */}
                    {/* DESKTOP NAVIGATION */}
                    {/* --------------------------------------- */}

                    <ul className="desktopNav">
                        {navigation.map((item) => (
                            <li key={item.href}>
                                {item.href ===
                                "/series" ? (
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
                                ) : item.href ===
                                  "/search" ? (
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
                                    >
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        ))}

                        {/* --------------------------------------- */}
                        {/* ADMIN BUTTON */}
                        {/* --------------------------------------- */}

                        {user &&
                            isAdmin &&
                            !adminChecking && (
                                <li className="adminNavItem">
                                    <Link
                                        href="/admin"
                                        className="adminNavLink"
                                    >
                                        Admin
                                    </Link>
                                </li>
                            )}

                        {/* --------------------------------------- */}
                        {/* PROFILE */}
                        {/* --------------------------------------- */}

                        <li
                            className="profileNavItem"
                            ref={profileRef}
                        >
                            {user ? (
                                <div className="profileWrapper">
                                    <button
                                        type="button"
                                        className="profileAvatar"
                                        onClick={
                                            toggleProfile
                                        }
                                        aria-label="Open profile menu"
                                        aria-expanded={
                                            profileOpen
                                        }
                                        aria-haspopup="menu"
                                        style={{
                                            backgroundColor:
                                                avatarColor,
                                        }}
                                    >
                                        {initial}
                                    </button>

                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                className="profileMenu"
                                                initial={{
                                                    opacity: 0,
                                                    y: -10,
                                                    scale: 0.97,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    y: -10,
                                                    scale: 0.97,
                                                }}
                                                transition={{
                                                    duration: 0.18,
                                                }}
                                                role="menu"
                                            >
                                                <div className="profileHeader">
                                                    <div
                                                        className="profileMenuAvatar"
                                                        style={{
                                                            backgroundColor:
                                                                avatarColor,
                                                        }}
                                                    >
                                                        {initial}
                                                    </div>

                                                    <div className="profileIdentity">
                                                        <div className="profileName">
                                                            {
                                                                displayName
                                                            }
                                                        </div>

                                                        <div className="profileEmail">
                                                            {
                                                                user.email
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="profileDivider" />

                                                {/* ADMIN INSIDE PROFILE MENU */}
                                                {isAdmin &&
                                                    !adminChecking && (
                                                        <>
                                                            <Link
                                                                href="/admin"
                                                                className="profileMenuItem adminProfileItem"
                                                                onClick={() =>
                                                                    setProfileOpen(
                                                                        false
                                                                    )
                                                                }
                                                                role="menuitem"
                                                            >
                                                                <span>
                                                                    Admin Dashboard
                                                                </span>

                                                                <span className="menuArrow">
                                                                    →
                                                                </span>
                                                            </Link>

                                                            <div className="profileDivider" />
                                                        </>
                                                    )}

                                                <Link
                                                    href="/account"
                                                    className="profileMenuItem"
                                                    onClick={() =>
                                                        setProfileOpen(
                                                            false
                                                        )
                                                    }
                                                    role="menuitem"
                                                >
                                                    <span>
                                                        Profile & Settings
                                                    </span>

                                                    <span className="menuArrow">
                                                        →
                                                    </span>
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="profileSignOut"
                                                    onClick={
                                                        handleSignOut
                                                    }
                                                    role="menuitem"
                                                >
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link href="/login">
                                    Sign In
                                </Link>
                            )}
                        </li>
                    </ul>

                    {/* --------------------------------------- */}
                    {/* MOBILE MENU BUTTON */}
                    {/* --------------------------------------- */}

                    <button
                        className={`menuButton ${
                            menuOpen ? "open" : ""
                        }`}
                        onClick={() =>
                            setMenuOpen(!menuOpen)
                        }
                        aria-label="Toggle Menu"
                        aria-expanded={menuOpen}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </nav>

                {/* --------------------------------------- */}
                {/* MOBILE MENU */}
                {/* --------------------------------------- */}

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
                                ease: [
                                    0.22,
                                    1,
                                    0.36,
                                    1,
                                ],
                            }}
                        >
                            <div className="mobileMenuContent">
                                <button
                                    className="closeButton"
                                    onClick={() =>
                                        setMenuOpen(
                                            false
                                        )
                                    }
                                    aria-label="Close Menu"
                                >
                                    ✕
                                </button>

                                <ul>
                                    {navigation.map(
                                        (item) => (
                                            <li
                                                key={
                                                    item.href
                                                }
                                            >
                                                {item.href ===
                                                "/series" ? (
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
                                                        {
                                                            item.label
                                                        }
                                                    </button>
                                                ) : item.href ===
                                                  "/search" ? (
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
                                                        {
                                                            item.label
                                                        }
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={
                                                            item.href
                                                        }
                                                        onClick={() =>
                                                            setMenuOpen(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        {
                                                            item.label
                                                        }
                                                    </Link>
                                                )}
                                            </li>
                                        )
                                    )}

                                    {/* --------------------------------------- */}
                                    {/* MOBILE ADMIN */}
                                    {/* --------------------------------------- */}

                                    {user &&
                                        isAdmin &&
                                        !adminChecking && (
                                            <li className="mobileAdminSection">
                                                <Link
                                                    href="/admin"
                                                    className="mobileAdminLink"
                                                    onClick={() =>
                                                        setMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            </li>
                                        )}

                                    {/* --------------------------------------- */}
                                    {/* MOBILE PROFILE */}
                                    {/* --------------------------------------- */}

                                    <li className="mobileProfileSection">
                                        {user ? (
                                            <>
                                                <Link
                                                    href="/account"
                                                    className="mobileProfileLink"
                                                    onClick={() =>
                                                        setMenuOpen(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <span
                                                        className="mobileProfileAvatar"
                                                        style={{
                                                            backgroundColor:
                                                                avatarColor,
                                                        }}
                                                    >
                                                        {
                                                            initial
                                                        }
                                                    </span>

                                                    <span>
                                                        Profile
                                                    </span>
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
                onClose={() =>
                    setSearchOpen(false)
                }
                triggerRef={searchButtonRef}
            />

            {/* SERIES OVERLAY */}

            <SeriesOverlay
                isOpen={seriesOpen}
                onClose={() =>
                    setSeriesOpen(false)
                }
                triggerRef={seriesButtonRef}
            />

            <style jsx>{`
                .profile-layer {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    z-index: 10000;
                }

                .profileNavItem {
                    display: flex;
                    align-items: center;
                    position: relative;
                    z-index: 10001;
                }

                .profileWrapper {
                    position: relative;
                    z-index: 10002;
                }

                /* --------------------------------------- */
                /* ADMIN NAVIGATION */
                /* --------------------------------------- */

                .adminNavItem {
                    display: flex;
                    align-items: center;
                }

                .adminNavLink {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;

                    padding: 8px 14px;

                    border: 1px solid
                        rgba(255, 255, 255, 0.16);

                    border-radius: 8px;

                    background: rgba(
                        255,
                        255,
                        255,
                        0.04
                    );

                    color: #ffffff;

                    text-decoration: none;

                    font-size: 13px;
                    font-weight: 600;

                    transition:
                        background 0.2s ease,
                        border-color 0.2s ease,
                        transform 0.2s ease;
                }

                .adminNavLink:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.09
                    );

                    border-color: rgba(
                        255,
                        255,
                        255,
                        0.3
                    );

                    transform: translateY(-1px);
                }

                .adminProfileItem {
                    color: #ffffff !important;
                    font-weight: 600;
                }

                /* --------------------------------------- */
                /* PROFILE AVATAR */
                /* --------------------------------------- */

                .profileAvatar {
                    width: 38px;
                    height: 38px;
                    padding: 0;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border: 2px solid
                        rgba(255, 255, 255, 0.85);

                    border-radius: 50%;

                    box-sizing: border-box;

                    color: #ffffff;

                    font-size: 15px;
                    font-weight: 700;

                    font-family:
                        Arial, Helvetica, sans-serif;

                    cursor: pointer;

                    box-shadow:
                        0 0 0 2px
                            rgba(0, 0, 0, 0.45),
                        0 4px 14px
                            rgba(0, 0, 0, 0.25);

                    transition:
                        transform 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .profileAvatar:hover {
                    transform: scale(1.08);

                    box-shadow:
                        0 0 0 2px
                            rgba(255, 255, 255, 0.18),
                        0 6px 18px
                            rgba(0, 0, 0, 0.35);
                }

                /* --------------------------------------- */
                /* PROFILE MENU */
                /* --------------------------------------- */

                .profileMenu {
                    position: absolute;

                    top: calc(100% + 14px);
                    right: 0;

                    width: 300px;

                    padding: 10px;

                    box-sizing: border-box;

                    background: #111111 !important;
                    background-color: #111111 !important;

                    border: 1px solid
                        rgba(255, 255, 255, 0.14);

                    border-radius: 16px;

                    box-shadow:
                        0 24px 70px
                            rgba(0, 0, 0, 0.75),
                        0 8px 30px
                            rgba(0, 0, 0, 0.5),
                        inset 0 1px 0
                            rgba(255, 255, 255, 0.05);

                    z-index: 100000 !important;

                    isolation: isolate;

                    overflow: hidden;

                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                }

                .profileHeader {
                    display: flex;
                    align-items: center;

                    gap: 13px;

                    padding: 12px;
                }

                .profileMenuAvatar {
                    width: 48px;
                    height: 48px;

                    flex-shrink: 0;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border: 2px solid
                        rgba(255, 255, 255, 0.8);

                    border-radius: 50%;

                    color: #ffffff;

                    font-size: 18px;
                    font-weight: 700;
                }

                .profileIdentity {
                    min-width: 0;
                }

                .profileName {
                    margin-bottom: 4px;

                    color: #ffffff;

                    font-size: 14px;
                    font-weight: 600;
                }

                .profileEmail {
                    max-width: 205px;

                    overflow: hidden;

                    color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );

                    font-size: 11px;

                    text-overflow: ellipsis;

                    white-space: nowrap;
                }

                .profileDivider {
                    height: 1px;

                    margin: 7px 4px;

                    background: rgba(
                        255,
                        255,
                        255,
                        0.08
                    );
                }

                .profileMenuItem {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;

                    padding: 13px 12px;

                    border-radius: 10px;

                    color: rgba(
                        255,
                        255,
                        255,
                        0.85
                    );

                    text-decoration: none;

                    font-size: 13px;

                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }

                .profileMenuItem:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );

                    color: #ffffff;
                }

                .menuArrow {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.35
                    );

                    font-size: 16px;
                }

                .profileSignOut {
                    width: 100%;

                    padding: 13px 12px;

                    border: 0;

                    border-radius: 10px;

                    background: transparent;

                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );

                    text-align: left;

                    font-size: 13px;

                    cursor: pointer;

                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }

                .profileSignOut:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );

                    color: #ffffff;
                }

                /* --------------------------------------- */
                /* MOBILE */
                /* --------------------------------------- */

                .mobileAdminSection {
                    margin-top: 8px;
                }

                .mobileAdminLink {
                    display: block;

                    padding: 12px 0;

                    color: #ffffff !important;

                    text-decoration: none;

                    font-weight: 600;
                }

                .mobileProfileSection {
                    display: flex;

                    flex-direction: column;

                    gap: 8px;
                }

                .mobileProfileLink {
                    display: flex;
                    align-items: center;

                    gap: 12px;
                }

                .mobileProfileAvatar {
                    width: 34px;
                    height: 34px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border: 2px solid
                        rgba(255, 255, 255, 0.8);

                    border-radius: 50%;

                    color: #ffffff;

                    font-size: 14px;
                    font-weight: 700;
                }

                @media (max-width: 768px) {
                    .profileMenu {
                        display: none;
                    }

                    .adminNavItem {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}