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

const AVATAR_COLORS = [
    "#E50914",
    "#2563EB",
    "#7C3AED",
    "#059669",
    "#D97706",
    "#DB2777",
    "#0891B2",
    "#65A30D",
];

function getDisplayName(user: User) {
    const metadataName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name;

    if (metadataName) {
        return metadataName;
    }

    const email = user.email || "";
    const username = email.split("@")[0];

    return username
        .replace(/[._-]+/g, " ")
        .split(" ")
        .filter(Boolean)
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}

function getAvatarColor(user: User) {
    if (user.user_metadata?.avatar_color) {
        return user.user_metadata.avatar_color;
    }

    const value = user.email || user.id || "user";

    let hash = 0;

    for (let i = 0; i < value.length; i++) {
        hash =
            value.charCodeAt(i) +
            ((hash << 5) - hash);
    }

    return AVATAR_COLORS[
        Math.abs(hash) % AVATAR_COLORS.length
    ];
}

export default function AccountPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [signingOut, setSigningOut] = useState(false);

    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState("");
    const [savingName, setSavingName] = useState(false);

    const [showAvatarColors, setShowAvatarColors] =
        useState(false);

    const [selectedAvatarColor, setSelectedAvatarColor] =
        useState("");

    const [savingAvatar, setSavingAvatar] =
        useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            const currentName = getDisplayName(user);
            const currentColor = getAvatarColor(user);

            setUser(user);
            setNameValue(currentName);
            setSelectedAvatarColor(currentColor);
            setLoading(false);
        };

        loadUser();
    }, [router]);

    const handleSaveName = async () => {
        const trimmedName = nameValue.trim();

        if (!trimmedName) {
            setError("Display name cannot be empty.");
            return;
        }

        if (trimmedName.length > 40) {
            setError(
                "Display name must be 40 characters or less."
            );
            return;
        }

        setSavingName(true);
        setError("");
        setMessage("");

        const { data, error } =
            await supabase.auth.updateUser({
                data: {
                    full_name: trimmedName,
                    name: trimmedName,
                },
            });

        if (error) {
            setError(error.message);
            setSavingName(false);
            return;
        }

        if (data.user) {
            setUser(data.user);
        }

        setEditingName(false);
        setSavingName(false);
        setMessage("Display name updated.");
    };

    const handleAvatarColor = async (
        color: string
    ) => {
        setSavingAvatar(true);
        setError("");
        setMessage("");

        const { data, error } =
            await supabase.auth.updateUser({
                data: {
                    avatar_color: color,
                },
            });

        if (error) {
            setError(error.message);
            setSavingAvatar(false);
            return;
        }

        if (data.user) {
            setUser(data.user);
            setSelectedAvatarColor(color);
        }

        setSavingAvatar(false);
        setShowAvatarColors(false);
        setMessage("Profile picture updated.");
    };

    const handleSignOut = async () => {
        setSigningOut(true);

        await supabase.auth.signOut();

        router.replace("/");
        router.refresh();
    };

    if (loading) {
        return (
            <main className="accountPage">
                <div className="loading">
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

                    .loading {
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

    const displayName = getDisplayName(user);

    const initial =
        displayName.charAt(0).toUpperCase() || "U";

    const avatarColor =
        selectedAvatarColor || getAvatarColor(user);

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

                {/* PROFILE HEADER */}
                <section className="profileHero">
                    <button
                        type="button"
                        className="profileAvatarButton"
                        onClick={() =>
                            setShowAvatarColors(
                                !showAvatarColors
                            )
                        }
                        aria-label="Change profile picture"
                    >
                        <div
                            className="profileAvatar"
                            style={{
                                backgroundColor:
                                    avatarColor,
                            }}
                        >
                            {initial}
                        </div>
                    </button>

                    <div className="profileIdentity">
                        <p className="eyebrow">
                            DAO STUDIOS
                        </p>

                        <h1>{displayName}</h1>

                        <p className="email">
                            {user.email}
                        </p>

                        {emailVerified && (
                            <div className="verified">
                                <span className="verifiedIcon">
                                    ✓
                                </span>

                                Email Verified
                            </div>
                        )}
                    </div>
                </section>

                {/* PROFILE */}
                <section className="settingsCard">
                    <div className="sectionHeader">
                        <h2>Profile</h2>

                        <p>
                            Manage your DAO Studios
                            profile.
                        </p>
                    </div>

                    {/* PROFILE PICTURE */}
                    <div className="settingRow avatarRow">
                        <div className="settingInfo">
                            <span className="settingLabel">
                                Profile picture
                            </span>

                            <span className="settingDescription">
                                Choose your profile avatar
                            </span>
                        </div>

                        <button
                            type="button"
                            className="smallAvatarButton"
                            onClick={() =>
                                setShowAvatarColors(
                                    !showAvatarColors
                                )
                            }
                            disabled={savingAvatar}
                            aria-label="Change profile picture"
                        >
                            <div
                                className="smallAvatar"
                                style={{
                                    backgroundColor:
                                        avatarColor,
                                }}
                            >
                                {initial}
                            </div>
                        </button>
                    </div>

                    {/* AVATAR COLOR PICKER */}
                    {showAvatarColors && (
                        <div className="avatarPicker">
                            <div className="avatarPickerTitle">
                                Choose profile color
                            </div>

                            <div className="avatarColors">
                                {AVATAR_COLORS.map(
                                    (color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`avatarColorButton ${
                                                avatarColor ===
                                                color
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            style={{
                                                backgroundColor:
                                                    color,
                                            }}
                                            onClick={() =>
                                                handleAvatarColor(
                                                    color
                                                )
                                            }
                                            disabled={
                                                savingAvatar
                                            }
                                            aria-label={`Choose ${color}`}
                                        >
                                            {avatarColor ===
                                                color && (
                                                <span>
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* DISPLAY NAME */}
                    {!editingName ? (
                        <button
                            type="button"
                            className="settingRow editableRow"
                            onClick={() => {
                                setNameValue(
                                    displayName
                                );
                                setEditingName(true);
                                setError("");
                                setMessage("");
                            }}
                        >
                            <div className="settingInfo">
                                <span className="settingLabel">
                                    Display name
                                </span>

                                <span className="settingDescription">
                                    {displayName}
                                </span>
                            </div>

                            <span className="arrow">
                                →
                            </span>
                        </button>
                    ) : (
                        <div className="editNameArea">
                            <label
                                htmlFor="displayName"
                                className="editLabel"
                            >
                                Display name
                            </label>

                            <input
                                id="displayName"
                                type="text"
                                value={nameValue}
                                onChange={(e) =>
                                    setNameValue(
                                        e.target.value
                                    )
                                }
                                maxLength={40}
                                autoFocus
                                className="nameInput"
                            />

                            <div className="editActions">
                                <button
                                    type="button"
                                    className="cancelButton"
                                    onClick={() => {
                                        setEditingName(
                                            false
                                        );
                                        setNameValue(
                                            displayName
                                        );
                                        setError("");
                                    }}
                                    disabled={
                                        savingName
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="saveButton"
                                    onClick={
                                        handleSaveName
                                    }
                                    disabled={
                                        savingName
                                    }
                                >
                                    {savingName
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* ACCOUNT */}
                <section className="settingsCard">
                    <div className="sectionHeader">
                        <h2>Account</h2>

                        <p>
                            Your account information.
                        </p>
                    </div>

                    <div className="settingRow">
                        <div className="settingInfo">
                            <span className="settingLabel">
                                Email address
                            </span>

                            <span className="settingDescription">
                                {user.email}
                            </span>
                        </div>

                        <span
                            className={
                                emailVerified
                                    ? "status verifiedStatus"
                                    : "status"
                            }
                        >
                            {emailVerified
                                ? "Verified"
                                : "Not verified"}
                        </span>
                    </div>
                </section>

                {/* SECURITY */}
                <section className="settingsCard">
                    <div className="sectionHeader">
                        <h2>Security</h2>

                        <p>
                            Manage your account security.
                        </p>
                    </div>

                    <Link
                        href="/account/change-password"
                        className="changePasswordRow"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "20px",
                            width: "100%",
                            minHeight: "70px",
                            margin: 0,
                            padding: "16px 26px",
                            boxSizing: "border-box",
                            border: 0,
                            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
                            background: "transparent",
                            color: "inherit",
                            textDecoration: "none",
                            textAlign: "left",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            className="settingInfo"
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                                minWidth: 0,
                                flex: 1,
                                textAlign: "left",
                            }}
                        >
                            <span className="settingLabel">
                                Change password
                            </span>

                            <span className="settingDescription">
                                Update your account password
                            </span>
                        </div>

                        <span
                            className="arrow"
                            style={{
                                flexShrink: 0,
                                marginLeft: "auto",
                                color: "rgba(255, 255, 255, 0.35)",
                                fontSize: "18px",
                            }}
                        >
                            →
                        </span>
                    </Link>
                </section>

                {/* MESSAGES */}
                {message && (
                    <div className="successMessage">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="errorMessage">
                        {error}
                    </div>
                )}

                {/* SIGN OUT */}
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

            <style jsx>{`
                .accountPage {
                    min-height: 100vh;
                    padding: 120px 24px 80px;
                    background:
                        radial-gradient(
                            circle at 50% 0%,
                            rgba(
                                255,
                                255,
                                255,
                                0.04
                            ),
                            transparent 40%
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
                    margin-bottom: 32px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                    text-decoration: none;
                    font-size: 14px;
                    transition: color 0.2s ease;
                }

                .backLink:hover {
                    color: #ffffff;
                }

                .profileHero {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding: 10px 0 42px;
                }

                .profileAvatarButton {
                    padding: 0;
                    border: 0;
                    background: transparent;
                    cursor: pointer;
                    border-radius: 50%;
                }

                .profileAvatarButton:hover
                    .profileAvatar {
                    transform: scale(1.04);
                    border-color: #ffffff;
                }

                .profileAvatar {
                    width: 96px;
                    height: 96px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 3px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.85
                        );
                    border-radius: 50%;
                    color: #ffffff;
                    font-size: 38px;
                    font-weight: 700;
                    box-shadow:
                        0 0 0 4px
                            rgba(
                                0,
                                0,
                                0,
                                0.45
                            ),
                        0 15px 40px
                            rgba(
                                0,
                                0,
                                0,
                                0.35
                            );
                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease;
                }

                .profileIdentity {
                    min-width: 0;
                }

                .eyebrow {
                    margin: 0 0 6px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                .profileIdentity h1 {
                    margin: 0;
                    font-size: 32px;
                    line-height: 1.15;
                    letter-spacing: -0.5px;
                }

                .email {
                    margin: 8px 0 12px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                    font-size: 14px;
                    overflow-wrap: anywhere;
                }

                .verified {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    border-radius: 999px;
                    background: rgba(
                        80,
                        200,
                        140,
                        0.1
                    );
                    color: #9be2bd;
                    font-size: 11px;
                    font-weight: 600;
                }

                .verifiedIcon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #9be2bd;
                    color: #07140d;
                    font-size: 9px;
                    font-weight: 800;
                }

                .settingsCard {
                    margin-bottom: 18px;
                    overflow: hidden;
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.09
                        );
                    border-radius: 18px;
                    background: rgba(
                        17,
                        17,
                        17,
                        0.9
                    );
                }

                .sectionHeader {
                    padding: 24px 26px 16px;
                }

                .sectionHeader h2 {
                    margin: 0 0 5px;
                    font-size: 16px;
                    font-weight: 600;
                }

                .sectionHeader p {
                    margin: 0;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
                    font-size: 12px;
                }

                .settingRow {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    min-height: 70px;
                    width: 100%;
                    padding: 16px 26px;
                    border: 0;
                    border-top: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.07
                        );
                    box-sizing: border-box;
                }

                .settingInfo {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    min-width: 0;
                    text-align: left;
                }

                .settingLabel {
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 500;
                }

                .settingDescription {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
                    font-size: 12px;
                    overflow-wrap: anywhere;
                }

                .avatarRow {
                    background: transparent;
                }

                .smallAvatarButton {
                    flex-shrink: 0;
                    padding: 0;
                    border: 0;
                    background: transparent;
                    border-radius: 50%;
                    cursor: pointer;
                }

                .smallAvatarButton:hover
                    .smallAvatar {
                    transform: scale(1.05);
                    border-color: #ffffff;
                }

                .smallAvatarButton:disabled {
                    cursor: wait;
                }

                .smallAvatar {
                    width: 42px;
                    height: 42px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.75
                        );
                    border-radius: 50%;
                    color: #ffffff;
                    font-size: 16px;
                    font-weight: 700;
                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease;
                }

                .avatarPicker {
                    padding: 18px 26px 22px;
                    border-top: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.07
                        );
                    background: rgba(
                        255,
                        255,
                        255,
                        0.025
                    );
                }

                .avatarPickerTitle {
                    margin-bottom: 14px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.6
                    );
                    font-size: 12px;
                    font-weight: 500;
                }

                .avatarColors {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .avatarColorButton {
                    width: 38px;
                    height: 38px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    border: 2px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.15
                        );
                    border-radius: 50%;
                    color: #ffffff;
                    font-size: 15px;
                    cursor: pointer;
                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease;
                }

                .avatarColorButton:hover {
                    transform: scale(1.1);
                    border-color: #ffffff;
                }

                .avatarColorButton.selected {
                    border: 3px solid #ffffff;
                    box-shadow:
                        0 0 0 2px
                            rgba(
                                255,
                                255,
                                255,
                                0.2
                            );
                }

                .editableRow {
                    cursor: pointer;
                    color: inherit;
                    background: transparent;
                    text-align: left;
                    transition:
                        background 0.2s ease;
                }

                .editableRow:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.04
                    );
                }

                .arrow {
                    flex-shrink: 0;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.35
                    );
                    font-size: 18px;
                }

                .editNameArea {
                    padding: 20px 26px 22px;
                    border-top: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.07
                        );
                }

                .editLabel {
                    display: block;
                    margin-bottom: 9px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.55
                    );
                    font-size: 12px;
                }

                .nameInput {
                    width: 100%;
                    padding: 12px 14px;
                    box-sizing: border-box;

                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.15
                        );
                    border-radius: 10px;

                    outline: none;

                    background: #080808;
                    color: #ffffff;

                    font-family: inherit;
                    font-size: 14px;

                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease;
                }

                .nameInput:focus {
                    border-color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );
                    background: #0b0b0b;
                }

                .editActions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 12px;
                }

                .cancelButton,
                .saveButton {
                    padding: 9px 16px;
                    border-radius: 9px;
                    font-family: inherit;
                    font-size: 12px;
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        color 0.2s ease;
                }

                .cancelButton {
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.1
                        );
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.6
                    );
                }

                .cancelButton:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
                    color: #ffffff;
                }

                .saveButton {
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.2
                        );
                    background: #ffffff;
                    color: #000000;
                    font-weight: 600;
                }

                .saveButton:hover {
                    background: #e8e8e8;
                }

                .cancelButton:disabled,
                .saveButton:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .changePasswordRow {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                    width: 100%;
                    min-height: 70px;
                    margin: 0;
                    padding: 16px 26px;
                    box-sizing: border-box;

                    border: 0;
                    border-top: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.07
                        );

                    background: transparent;
                    color: inherit;
                    text-decoration: none;

                    cursor: pointer;

                    transition:
                        background 0.2s ease;
                }

                .changePasswordRow:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.04
                    );
                }

                .status {
                    flex-shrink: 0;
                    padding: 6px 10px;
                    border-radius: 999px;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.06
                    );
                    color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );
                    font-size: 11px;
                    font-weight: 600;
                }

                .verifiedStatus {
                    background: rgba(
                        80,
                        200,
                        140,
                        0.1
                    );
                    color: #9be2bd;
                }

                .successMessage,
                .errorMessage {
                    margin: -4px 0 14px;
                    padding: 11px 14px;
                    border-radius: 10px;
                    font-size: 12px;
                }

                .successMessage {
                    border: 1px solid
                        rgba(
                            80,
                            200,
                            140,
                            0.15
                        );
                    background: rgba(
                        80,
                        200,
                        140,
                        0.08
                    );
                    color: #9be2bd;
                }

                .errorMessage {
                    border: 1px solid
                        rgba(
                            229,
                            9,
                            20,
                            0.2
                        );
                    background: rgba(
                        229,
                        9,
                        20,
                        0.08
                    );
                    color: #ff9da3;
                }

                .signOutButton {
                    width: 100%;
                    margin-top: 8px;
                    padding: 15px;
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.1
                        );
                    border-radius: 12px;
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.65
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

                    .profileHero {
                        align-items: flex-start;
                        gap: 18px;
                        padding-bottom: 32px;
                    }

                    .profileAvatar {
                        width: 76px;
                        height: 76px;
                        font-size: 30px;
                    }

                    .profileIdentity h1 {
                        font-size: 25px;
                    }

                    .sectionHeader {
                        padding: 22px 20px 14px;
                    }

                    .settingRow,
                    .changePasswordRow {
                        padding: 15px 20px;
                    }

                    .avatarPicker,
                    .editNameArea {
                        padding-left: 20px;
                        padding-right: 20px;
                    }
                }
            `}</style>
        </main>
    );
}