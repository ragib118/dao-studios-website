"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ChangePasswordPage() {
    const router = useRouter();

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const handleChangePassword = async () => {
        setError("");
        setMessage("");

        if (
            !currentPassword ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Please fill in all password fields."
            );
            return;
        }

        if (password.length < 8) {
            setError(
                "New password must be at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (currentPassword === password) {
            setError(
                "Your new password must be different from your current password."
            );
            return;
        }

        setSaving(true);

        const { error: updateError } =
            await supabase.auth.updateUser({
                password,
                current_password: currentPassword,
            });

        if (updateError) {
            setError(updateError.message);
            setSaving(false);
            return;
        }

        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");

        setMessage(
            "Your password has been updated successfully."
        );

        setSaving(false);
    };

    return (
        <main className="page">
            <div className="container">

                {/* BACK */}
                <button
                    type="button"
                    className="backButton"
                    onClick={() =>
                        router.push("/account")
                    }
                >
                    ← Back to Account
                </button>

                {/* CARD */}
                <section className="card">

                    {/* HEADER */}
                    <div className="header">
                        <h1>Change password</h1>

                        <p>
                            Create a new password for your
                            DAO Studios account.
                        </p>
                    </div>

                    {/* FORM */}
                    <div className="form">

                        {/* CURRENT PASSWORD */}
                        <label htmlFor="currentPassword">
                            Current password
                        </label>

                        <div className="passwordWrapper">
                            <input
                                id="currentPassword"
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your current password"
                                autoComplete="current-password"
                            />

                            <button
                                type="button"
                                className="eyeButton"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        !showCurrentPassword
                                    )
                                }
                                aria-label={
                                    showCurrentPassword
                                        ? "Hide current password"
                                        : "Show current password"
                                }
                            >
                            {showCurrentPassword ? (
                                <EyeIcon />
                            ) : (
                                <EyeOffIcon />
                            )}
                            </button>
                        </div>

                        {/* NEW PASSWORD */}
                        <label htmlFor="password">
                            New password
                        </label>

                        <div className="passwordWrapper">
                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your new password"
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="eyeButton"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide new password"
                                        : "Show new password"
                                }
                            >
                            {showPassword ? (
                                <EyeIcon />
                            ) : (
                                <EyeOffIcon />
                            )}
                            </button>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <label htmlFor="confirmPassword">
                            Confirm new password
                        </label>

                        <div className="passwordWrapper">
                            <input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your new password again"
                                autoComplete="new-password"
                            />

                            <button
                                type="button"
                                className="eyeButton"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide confirm password"
                                        : "Show confirm password"
                                }
                            >
                            {showConfirmPassword ? (
                                <EyeIcon />
                            ) : (
                                <EyeOffIcon />
                            )}
                            </button>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {message && (
                            <div className="success">
                                {message}
                            </div>
                        )}

                        {/* UPDATE BUTTON */}
                        <button
                            type="button"
                            className="saveButton"
                            onClick={
                                handleChangePassword
                            }
                            disabled={saving}
                        >
                            {saving
                                ? "Updating..."
                                : "Update password"}
                        </button>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .page {
                    min-height: 100vh;
                    padding: 120px 24px 80px;
                    box-sizing: border-box;
                    background: #050505;
                    color: #ffffff;
                }

                .container {
                    width: 100%;
                    max-width: 760px;
                    margin: 0 auto;
                }

                .backButton {
                    display: block;
                    margin: 0 0 28px 0;
                    padding: 0;
                    border: 0;
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.5;
                    text-align: left;
                    cursor: pointer;
                    transition: color 0.2s ease;
                }

                .backButton:hover {
                    color: #ffffff;
                }

                .card {
                    width: 100%;
                    overflow: hidden;
                    box-sizing: border-box;
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.09
                        );
                    border-radius: 18px;
                    background: #111111;
                }

                .header {
                    padding: 28px;
                    border-bottom: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.07
                        );
                    box-sizing: border-box;
                }

                .header h1 {
                    margin: 0 0 7px;
                    font-size: 22px;
                    font-weight: 600;
                    line-height: 1.3;
                }

                .header p {
                    margin: 0;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.4
                    );
                    font-size: 13px;
                    line-height: 1.5;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    padding: 28px;
                    box-sizing: border-box;
                }

                .form label {
                    display: block;
                    width: 100%;
                    margin: 0 0 8px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.65
                    );
                    font-size: 12px;
                    line-height: 1.4;
                }

                .passwordWrapper {
                    position: relative;
                    width: 100%;
                    margin: 0 0 20px;
                }

                .passwordWrapper input {
                    display: block;
                    width: 100%;
                    height: 46px;
                    margin: 0;
                    padding: 13px 46px 13px 14px;
                    box-sizing: border-box;
                    border: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.13
                        );
                    border-radius: 10px;
                    outline: none;
                    background: #080808;
                    color: #ffffff;
                    font-family: inherit;
                    font-size: 14px;
                    line-height: 1.4;
                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease;
                }

                .passwordWrapper input:focus {
                    border-color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );
                    background: #0b0b0b;
                }

                .passwordWrapper input::placeholder {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.25
                    );
                }

                .eyeButton {
                    position: absolute;
                    top: 50%;
                    right: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 34px;
                    height: 34px;
                    padding: 0;
                    border: 0;
                    border-radius: 7px;
                    transform: translateY(-50%);
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.4
                    );
                    cursor: pointer;
                    transition:
                        color 0.2s ease,
                        background 0.2s ease;
                }

                .eyeButton:hover {
                    background: rgba(
                        255,
                        255,
                        255,
                        0.07
                    );
                    color: #ffffff;
                }

                .eyeButton:focus-visible {
                    outline: 1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.5
                        );
                    outline-offset: 1px;
                }

                .error,
                .success {
                    width: 100%;
                    margin: 0 0 16px;
                    padding: 11px 13px;
                    box-sizing: border-box;
                    border-radius: 9px;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .error {
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

                .success {
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

                .saveButton {
                    display: block;
                    width: 100%;
                    height: 46px;
                    margin: 4px 0 0;
                    padding: 13px 16px;
                    box-sizing: border-box;
                    border: 0;
                    border-radius: 10px;
                    background: #ffffff;
                    color: #000000;
                    font-family: inherit;
                    font-size: 13px;
                    font-weight: 600;
                    line-height: 1.4;
                    cursor: pointer;
                    transition:
                        background 0.2s ease,
                        opacity 0.2s ease;
                }

                .saveButton:hover:not(:disabled) {
                    background: #e8e8e8;
                }

                .saveButton:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 600px) {
                    .page {
                        padding: 100px 16px 50px;
                    }

                    .header,
                    .form {
                        padding-left: 20px;
                        padding-right: 20px;
                    }
                }
            `}</style>
        </main>
    );
}

/* =========================
   EYE ICON
========================= */

function EyeIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx="12"
                cy="12"
                r="3"
                stroke="currentColor"
                strokeWidth="1.7"
            />
        </svg>
    );
}

/* =========================
   EYE OFF ICON
========================= */

function EyeOffIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M3 3L21 21"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />

            <path
                d="M10.6 5.2C11.05 5.07 11.52 5 12 5C18.5 5 22 12 22 12C22 12 20.75 14.5 18.35 16.4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M6.2 7.05C3.55 9.1 2 12 2 12C2 12 5.5 19 12 19C13.5 19 14.85 18.65 16.05 18.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <path
                d="M9.9 9.9C9.35 10.45 9 11.2 9 12C9 13.65 10.35 15 12 15C12.8 15 13.55 14.65 14.1 14.1"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}