"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot";

function getSafeNextPath() {
    const next = new URLSearchParams(
        window.location.search
    ).get("next");

    if (!next || !next.startsWith("/") || next.startsWith("//")) {
        return "/";
    }

    return next;
}

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const supabase = createClient();

    useEffect(() => {
        const params = new URLSearchParams(
            window.location.search
        );

        const incomingMessage = params.get("message");
        const incomingError = params.get("error");

        if (incomingMessage) {
            setMessage(incomingMessage);
        }

        if (incomingError === "confirmation_failed") {
            setError(
                "Email confirmation failed. Please try again."
            );
        }
    }, []);

    const clearMessages = () => {
        setMessage("");
        setError("");
    };

    // ---------------------------------------
    // LOGIN
    // ---------------------------------------

    const handleLogin = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        clearMessages();
        setLoading(true);

        const {
            data: authData,
            error: loginError,
        } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) {
            setError(loginError.message);
            setLoading(false);
            return;
        }

        const user = authData.user;

        if (!user) {
            setError(
                "Login succeeded, but no user session was found."
            );
            setLoading(false);
            return;
        }

        const nextPath = getSafeNextPath();

        // ---------------------------------------
        // CHECK ADMIN STATUS
        // ---------------------------------------

        const {
            data: adminData,
            error: adminError,
        } = await supabase
            .from("admin_users")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle();

        // If the admin check fails,
        // still allow normal login.
        if (adminError) {
            console.error(
                "ADMIN CHECK ERROR:",
                adminError
            );

            window.location.href = nextPath;
            return;
        }

        // ---------------------------------------
        // OWNER → ADMIN DASHBOARD
        // ---------------------------------------

        if (adminData?.role === "owner") {
            window.location.href = "/admin";
            return;
        }

        // ---------------------------------------
        // NORMAL USER → ORIGINAL DESTINATION
        // ---------------------------------------

        window.location.href = nextPath;
    };

    // ---------------------------------------
    // SIGN UP
    // ---------------------------------------

    const handleSignup = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        clearMessages();

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters long."
            );
            return;
        }

        setLoading(true);

        const siteUrl =
            window.location.hostname === "localhost"
                ? window.location.origin
                : "https://www.daostudios.co";

        const nextPath = getSafeNextPath();
        const confirmationUrl =
            `${siteUrl}/auth/confirm?next=${encodeURIComponent(
                nextPath
            )}`;

        const { error: signupError } =
            await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: confirmationUrl,
                },
            });

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
            return;
        }

        setMessage(
            "Account created. Please check your email and confirm your address before signing in."
        );
        setPassword("");
        setLoading(false);
    };

    // ---------------------------------------
    // FORGOT PASSWORD
    // ---------------------------------------

    const handleForgotPassword = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        clearMessages();
        setLoading(true);

        const siteUrl =
            window.location.hostname === "localhost"
                ? window.location.origin
                : "https://www.daostudios.co";

        const resetUrl =
            `${siteUrl}/reset-password`;

        const { error: resetError } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: resetUrl,
                }
            );

        if (resetError) {
            setError(resetError.message);
            setLoading(false);
            return;
        }

        setMessage(
            "If an account exists for this email, a password reset link has been sent."
        );
        setLoading(false);
    };

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>
    ) => {
        if (mode === "login") {
            return handleLogin(event);
        }

        if (mode === "signup") {
            return handleSignup(event);
        }

        return handleForgotPassword(event);
    };

    const title =
        mode === "login"
            ? "Welcome Back"
            : mode === "signup"
              ? "Create Account"
              : "Reset Password";

    const subtitle =
        mode === "login"
            ? "Sign in to continue to DAO Studios."
            : mode === "signup"
              ? "Create your DAO Studios account."
              : "Enter your email and we'll send you a reset link.";

    return (
        <main className="loginPage">
            <div className="loginBackground" />

            <section className="loginCard">
                <div className="loginLogo">
                    <Image
                        src="/logo.png"
                        alt="DAO Studios"
                        width={120}
                        height={84}
                        priority
                    />
                </div>

                <div className="loginHeader">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>

                {message && (
                    <div
                        className="loginMessage"
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        className="loginError"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="loginForm"
                >
                    <div className="formGroup">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>

                    {mode !== "forgot" && (
                        <div className="formGroup">
                            <div className="passwordLabelRow">
                                <label htmlFor="password">
                                    Password
                                </label>

                                {mode === "login" && (
                                    <button
                                        type="button"
                                        className="forgotButton"
                                        onClick={() => {
                                            clearMessages();
                                            setMode("forgot");
                                        }}
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>

                            <div className="passwordWrapper">
                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    placeholder="Enter your password"
                                    autoComplete={
                                        mode === "signup"
                                            ? "new-password"
                                            : "current-password"
                                    }
                                    minLength={8}
                                    required
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="showPasswordButton"
                                    onClick={() =>
                                        setShowPassword(
                                            (visible) => !visible
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>
                            </div>

                            {mode === "signup" && (
                                <span className="passwordHint">
                                    Minimum 8 characters. Use uppercase,
                                    lowercase, numbers and symbols.
                                </span>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="loginSubmit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "login"
                              ? "Sign In"
                              : mode === "signup"
                                ? "Create Account"
                                : "Send Reset Link"}
                    </button>
                </form>

                <div className="loginDivider">
                    <span>or</span>
                </div>

                <div className="loginSwitch">
                    {mode === "login" && (
                        <>
                            <span>Don't have an account?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    clearMessages();
                                    setMode("signup");
                                }}
                            >
                                Create one
                            </button>
                        </>
                    )}

                    {mode === "signup" && (
                        <>
                            <span>Already have an account?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    clearMessages();
                                    setMode("login");
                                }}
                            >
                                Sign in
                            </button>
                        </>
                    )}

                    {mode === "forgot" && (
                        <>
                            <span>Remember your password?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    clearMessages();
                                    setMode("login");
                                }}
                            >
                                Back to sign in
                            </button>
                        </>
                    )}
                </div>

                <div className="loginFooter">
                    <span>© DAO Studios</span>
                    <span>Secure authentication</span>
                </div>
            </section>

            <style jsx>{`
                .loginPage {
                    min-height: 100vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px 20px;
                    background: #050505;
                    overflow: hidden;
                }

                .loginBackground {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 50% 20%, rgba(180, 0, 0, 0.16), transparent 38%),
                        linear-gradient(180deg, rgba(0, 0, 0, 0.1), #050505);
                    pointer-events: none;
                }

                .loginCard {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 460px;
                    padding: 44px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    background: rgba(15, 15, 15, 0.92);
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(20px);
                }

                .loginLogo {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 20px;
                }

                .loginHeader {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .loginHeader h1 {
                    margin: 0 0 8px;
                    color: #ffffff;
                    font-size: 32px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .loginHeader p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.58);
                    font-size: 15px;
                    line-height: 1.5;
                }

                .loginForm {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .formGroup {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .formGroup label {
                    color: rgba(255, 255, 255, 0.86);
                    font-size: 14px;
                    font-weight: 500;
                }

                .passwordLabelRow {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .formGroup input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 14px 15px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    outline: none;
                    background: rgba(255, 255, 255, 0.045);
                    color: #ffffff;
                    font-size: 15px;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }

                .formGroup input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .formGroup input:focus {
                    border-color: rgba(220, 30, 30, 0.75);
                    background: rgba(255, 255, 255, 0.07);
                }

                .formGroup input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .passwordWrapper {
                    position: relative;
                }

                .passwordWrapper input {
                    padding-right: 70px;
                }

                .showPasswordButton,
                .forgotButton {
                    border: 0;
                    background: transparent;
                    cursor: pointer;
                }

                .showPasswordButton {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.55);
                    font-size: 13px;
                }

                .showPasswordButton:hover,
                .forgotButton:hover {
                    color: #ffffff;
                }

                .forgotButton {
                    padding: 0;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }

                .passwordHint {
                    color: rgba(255, 255, 255, 0.38);
                    font-size: 11px;
                    line-height: 1.4;
                }

                .loginSubmit {
                    width: 100%;
                    padding: 15px;
                    border: 0;
                    border-radius: 10px;
                    background: #ffffff;
                    color: #050505;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }

                .loginSubmit:hover:not(:disabled) {
                    transform: translateY(-1px);
                }

                .loginSubmit:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                }

                .loginDivider {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin: 26px 0 20px;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 12px;
                }

                .loginDivider::before,
                .loginDivider::after {
                    content: "";
                    height: 1px;
                    flex: 1;
                    background: rgba(255, 255, 255, 0.1);
                }

                .loginSwitch {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                    color: rgba(255, 255, 255, 0.48);
                    font-size: 13px;
                }

                .loginSwitch button {
                    border: 0;
                    padding: 0;
                    background: transparent;
                    color: #ffffff;
                    cursor: pointer;
                    font-weight: 600;
                }

                .loginSwitch button:hover {
                    text-decoration: underline;
                }

                .loginError,
                .loginMessage {
                    margin-bottom: 20px;
                    padding: 12px 14px;
                    border-radius: 9px;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .loginError {
                    border: 1px solid rgba(255, 70, 70, 0.25);
                    background: rgba(255, 40, 40, 0.08);
                    color: #ff9b9b;
                }

                .loginMessage {
                    border: 1px solid rgba(80, 200, 140, 0.25);
                    background: rgba(80, 200, 140, 0.08);
                    color: #a8e8c5;
                }

                .loginFooter {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 18px;
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                    color: rgba(255, 255, 255, 0.25);
                    font-size: 11px;
                }

                @media (max-width: 520px) {
                    .loginPage {
                        padding: 20px 14px;
                    }

                    .loginCard {
                        padding: 30px 22px;
                        border-radius: 18px;
                    }

                    .loginHeader h1 {
                        font-size: 28px;
                    }
                }
            `}</style>
        </main>
    );
}
