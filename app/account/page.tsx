"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            setUser(user);
            setLoading(false);
        };

        loadUser();
    }, [router]);

    const handleSignOut = async () => {
        setSigningOut(true);

        await supabase.auth.signOut();

        router.replace("/");
        router.refresh();
    };

    if (loading) {
        return (
            <main className="accountPage">
                <div className="accountLoading">
                    Loading...
                </div>

                <style jsx>{`
                    .accountPage {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #050505;
                        color: #ffffff;
                    }

                    .accountLoading {
                        color: rgba(255, 255, 255, 0.5);
                        font-size: 14px;
                    }
                `}</style>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    const emailVerified = Boolean(
        user.email_confirmed_at
    );

    return (
        <main className="accountPage">
            <div className="accountContainer">
                <Link
                    href="/"
                    className="backLink"
                >
                    ← Back to DAO Studios
                </Link>

                <section className="accountCard">
                    <div className="accountHeader">
                        <div className="accountAvatar">
                            {user.email
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                        </div>

                        <div>
                            <p className="eyebrow">
                                DAO STUDIOS
                            </p>

                            <h1>
                                Your Account
                            </h1>
                        </div>
                    </div>

                    <div className="accountSection">
                        <h2>
                            Account information
                        </h2>

                        <div className="infoRow">
                            <div>
                                <span className="infoLabel">
                                    Email
                                </span>

                                <span className="infoValue">
                                    {user.email}
                                </span>
                            </div>

                            <span
                                className={
                                    emailVerified
                                        ? "status verified"
                                        : "status"
                                }
                            >
                                {emailVerified
                                    ? "Verified"
                                    : "Not verified"}
                            </span>
                        </div>
                    </div>

                    <div className="accountSection">
                        <h2>
                            Security
                        </h2>

                        <Link
                            href="/account/change-password"
                            className="securityButton"
                        >
                            <span>
                                Change password
                            </span>

                            <span>
                                →
                            </span>
                        </Link>
                    </div>

                    <div className="accountActions">
                        <button
                            type="button"
                            className="signOutButton"
                            onClick={handleSignOut}
                            disabled={signingOut}
                        >
                            {signingOut
                                ? "Signing out..."
                                : "Sign Out"}
                        </button>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .accountPage {
                    min-height: 100vh;
                    padding: 120px 24px 80px;
                    background:
                        radial-gradient(
                            circle at 50% 10%,
                            rgba(180, 0, 0, 0.12),
                            transparent 38%
                        ),
                        #050505;
                    color: #ffffff;
                }

                .accountContainer {
                    width: 100%;
                    max-width: 760px;
                    margin: 0 auto;
                }

                .backLink {
                    display: inline-block;
                    margin-bottom: 24px;
                    color: rgba(255, 255, 255, 0.5);
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s ease;
                }

                .backLink:hover {
                    color: #ffffff;
                }

                .accountCard {
                    overflow: hidden;
                    border: 1px solid rgba(
                        255,
                        255,
                        255,
                        0.1
                    );
                    border-radius: 22px;
                    background: rgba(
                        16,
                        16,
                        16,
                        0.92
                    );
                    box-shadow:
                        0 30px 100px
                            rgba(0, 0, 0, 0.45),
                        inset 0 1px 0
                            rgba(255, 255, 255, 0.03);
                }

                .accountHeader {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    padding: 36px;
                    border-bottom: 1px solid
                        rgba(255, 255, 255, 0.08);
                }

                .accountAvatar {
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: #ffffff;
                    color: #050505;
                    font-size: 22px;
                    font-weight: 700;
                }

                .eyebrow {
                    margin: 0 0 5px;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .accountHeader h1 {
                    margin: 0;
                    font-size: 32px;
                    letter-spacing: -0.5px;
                }

                .accountSection {
                    padding: 30px 36px;
                    border-bottom: 1px solid
                        rgba(255, 255, 255, 0.08);
                }

                .accountSection h2 {
                    margin: 0 0 18px;
                    font-size: 15px;
                    font-weight: 600;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.65
                    );
                }

                .infoRow {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    padding: 18px;
                    border: 1px solid
                        rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
                }

                .infoRow > div {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    min-width: 0;
                }

                .infoLabel {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .infoValue {
                    color: #ffffff;
                    font-size: 14px;
                    overflow-wrap: anywhere;
                }

                .status {
                    flex-shrink: 0;
                    padding: 6px 10px;
                    border-radius: 999px;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.07
                    );
                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                    font-size: 11px;
                    font-weight: 600;
                }

                .status.verified {
                    background: rgba(
                        80,
                        200,
                        140,
                        0.1
                    );
                    color: #9be2bd;
                }

                .securityButton {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 17px 18px;
                    border: 1px solid
                        rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 14px;
                    transition:
                        background 0.2s ease,
                        border-color 0.2s ease;
                }

                .securityButton:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
                    border-color: rgba(
                        255,
                        255,
                        255,
                        0.15
                    );
                }

                .accountActions {
                    padding: 26px 36px;
                }

                .signOutButton {
                    width: 100%;
                    padding: 14px;
                    border: 1px solid
                        rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.75
                    );
                    font-size: 14px;
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }

                .signOutButton:hover:not(:disabled) {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
                    color: #ffffff;
                }

                .signOutButton:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 600px) {
                    .accountPage {
                        padding: 100px 16px 50px;
                    }

                    .accountHeader {
                        padding: 28px 22px;
                    }

                    .accountSection {
                        padding: 24px 22px;
                    }

                    .accountActions {
                        padding: 22px;
                    }

                    .accountHeader h1 {
                        font-size: 27px;
                    }

                    .infoRow {
                        align-items: flex-start;
                        flex-direction: column;
                    }
                }
            `}</style>
        </main>
    );
}