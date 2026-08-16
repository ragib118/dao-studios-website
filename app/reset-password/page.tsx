"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ResetPasswordPage() {
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let recoveryDetected = false;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
                recoveryDetected = true;
                setReady(true);
            }
        });

        const timer = window.setTimeout(() => {
            if (!recoveryDetected) {
                router.replace("/login");
            }
        }, 1200);

        return () => {
            window.clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, [router]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Your new password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setSaving(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        if (updateError) {
            setError(updateError.message);
            setSaving(false);
            return;
        }

        setMessage("Password updated successfully. Redirecting to login...");

        await supabase.auth.signOut({ scope: "global" });
        router.replace("/login");
    };

    return (
        <main className="resetPage">
            <section className="resetCard" aria-labelledby="reset-title">
                <Link href="/" className="brand">
                    DAO STUDIOS
                </Link>

                <div className="header">
                    <p className="eyebrow">ACCOUNT SECURITY</p>
                    <h1 id="reset-title">Set a new password</h1>
                    <p>
                        Choose a new password for your DAO Studios account.
                    </p>
                </div>

                {ready ? (
                    <form onSubmit={handleSubmit} className="form">
                        <label htmlFor="password">New password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            disabled={saving}
                        />

                        <label htmlFor="confirmPassword">Confirm password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={128}
                            required
                            disabled={saving}
                        />

                        <p className="hint">Use at least 8 characters.</p>

                        {error && <div className="error">{error}</div>}
                        {message && <div className="success">{message}</div>}

                        <button type="submit" disabled={saving}>
                            {saving ? "Updating..." : "Update password"}
                        </button>
                    </form>
                ) : (
                    <div className="loading">Verifying your recovery link...</div>
                )}

                <Link href="/login" className="backLink">
                    Back to login
                </Link>
            </section>

            <style jsx>{`
                .resetPage {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 20px;
                    box-sizing: border-box;
                    background: #050505;
                    color: #ffffff;
                }

                .resetCard {
                    width: 100%;
                    max-width: 430px;
                    padding: 34px;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 20px;
                    background: #111111;
                    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
                }

                .brand {
                    display: inline-block;
                    margin-bottom: 42px;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 2.5px;
                    text-decoration: none;
                }

                .header {
                    margin-bottom: 28px;
                }

                .eyebrow {
                    margin: 0 0 8px;
                    color: rgba(255, 255, 255, 0.38);
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 2px;
                }

                h1 {
                    margin: 0 0 9px;
                    font-size: 30px;
                    line-height: 1.15;
                    letter-spacing: -0.5px;
                }

                .header p:last-child {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 13px;
                    line-height: 1.6;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 9px;
                }

                label {
                    margin-top: 6px;
                    color: rgba(255, 255, 255, 0.72);
                    font-size: 12px;
                }

                input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 13px 14px;
                    border: 1px solid rgba(255, 255, 255, 0.13);
                    border-radius: 10px;
                    outline: none;
                    background: #080808;
                    color: #ffffff;
                    font: inherit;
                    font-size: 14px;
                }

                input:focus {
                    border-color: rgba(255, 255, 255, 0.42);
                }

                input:disabled {
                    opacity: 0.6;
                }

                .hint {
                    margin: 1px 0 5px;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 11px;
                }

                button {
                    margin-top: 8px;
                    padding: 13px 16px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    background: #ffffff;
                    color: #000000;
                    font: inherit;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }

                button:disabled {
                    opacity: 0.55;
                    cursor: wait;
                }

                .error,
                .success {
                    padding: 11px 13px;
                    border-radius: 9px;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .error {
                    border: 1px solid rgba(229, 9, 20, 0.2);
                    background: rgba(229, 9, 20, 0.08);
                    color: #ff9da3;
                }

                .success {
                    border: 1px solid rgba(80, 200, 140, 0.15);
                    background: rgba(80, 200, 140, 0.08);
                    color: #9be2bd;
                }

                .loading {
                    padding: 22px 0;
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 13px;
                }

                .backLink {
                    display: block;
                    margin-top: 22px;
                    color: rgba(255, 255, 255, 0.42);
                    font-size: 12px;
                    text-align: center;
                    text-decoration: none;
                }

                .backLink:hover {
                    color: #ffffff;
                }

                @media (max-width: 520px) {
                    .resetCard {
                        padding: 28px 22px;
                    }
                }
            `}</style>
        </main>
    );
}
