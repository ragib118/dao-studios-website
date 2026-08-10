"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
    const [mode, setMode] = useState<Mode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const supabase = createClient();

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

        console.log("LOGGED IN USER:", user);

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

        console.log("ADMIN DATA:", adminData);
        console.log("ADMIN ERROR:", adminError);

        // If admin check fails,
        // still allow normal login.
        if (adminError) {
            console.error(
                "ADMIN CHECK ERROR:",
                adminError
            );

            window.location.href = "/";
            return;
        }

        // ---------------------------------------
        // OWNER → ADMIN DASHBOARD
        // ---------------------------------------

        if (adminData?.role === "owner") {
            console.log(
                "OWNER DETECTED → REDIRECTING TO ADMIN"
            );

            window.location.href = "/admin";
            return;
        }

        // ---------------------------------------
        // NORMAL USER → HOMEPAGE
        // ---------------------------------------

        console.log(
            "NORMAL USER → REDIRECTING TO HOMEPAGE"
        );

        window.location.href = "/";
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

        // ---------------------------------------
        // IMPORTANT:
        // Email confirmation must go to /auth/confirm
        // ---------------------------------------

        const siteUrl =
            window.location.hostname === "localhost"
                ? window.location.origin
                : "https://www.daostudios.co";

        const confirmationUrl =
            `${siteUrl}/auth/confirm`;

        console.log(
            "EMAIL CONFIRMATION URL:",
            confirmationUrl
        );

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: confirmationUrl,
            },
        });

        if (error) {
            setError(error.message);
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

        const { error } =
            await supabase.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: resetUrl,
                }
            );

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setMessage(
            "If an account exists for this email, a password reset link has been sent."
        );

        setLoading(false);
    };

    // ---------------------------------------
    // FORM SUBMIT
    // ---------------------------------------

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

    // ---------------------------------------
    // PAGE TEXT
    // ---------------------------------------

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

    // ---------------------------------------
    // UI
    // ---------------------------------------

    return (
        <main className="loginPage">
            <div className="loginBackground" />

            <section className="loginCard">

                {/* LOGO */}

                <div className="loginLogo">
                    <Image
                        src="/logo.png"
                        alt="DAO Studios"
                        width={120}
                        height={84}
                        priority
                    />
                </div>

                {/* HEADER */}

                <div className="loginHeader">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div
                        className="loginMessage"
                        role="status"
                    >
                        {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                    <div
                        className="loginError"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="loginForm"
                >

                    {/* EMAIL */}

                    <div className="formGroup">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* PASSWORD */}

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
                                            setMode(
                                                "forgot"
                                            );
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
                                        setPassword(
                                            event.target
                                                .value
                                        )
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
                                            (visible) =>
                                                !visible
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
                                    Minimum 8 characters.
                                    Use uppercase,
                                    lowercase, numbers
                                    and symbols.
                                </span>
                            )}

                        </div>
                    )}

                    {/* SUBMIT BUTTON */}

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

                {/* DIVIDER */}

                <div className="loginDivider">
                    <span>or</span>
                </div>

                {/* MODE SWITCH */}

                <div className="loginSwitch">

                    {mode === "login" && (
                        <>
                            <span>
                                Don't have an account?
                            </span>

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
                            <span>
                                Already have an account?
                            </span>

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
                            <span>
                                Remember your password?
                            </span>

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

                {/* FOOTER */}

                <div className="loginFooter">
                    <span>© DAO Studios</span>

                    <span>
                        Secure authentication
                    </span>
                </div>

            </section>

            {/* STYLES */}

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
                        radial-gradient(
                            circle at 50% 20%,
                            rgba(180, 0, 0, 0.16),
                            transparent 38%
                        ),
                        linear-gradient(
                            180deg,
                            rgba(0, 0, 0, 0.1),
                            #050505
                        );
                    pointer-events: none;
                }

                .loginCard {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 460px;
                    padding: 44px;
                    border: 1px solid
                        rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    background: rgba(15, 15, 15, 0.92);
                    box-shadow:
                        0 30px 100px
                            rgba(0, 0, 0, 0.55),
                        inset 0 1px 0
                            rgba(255, 255, 255, 0.04);
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
                    border: 1px solid
                        rgba(255, 255, 255, 0.12);
                    border-radius: 10px;
                    outline: none;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.045
                    );
                    color: #ffffff;
                    font-size: 15px;
                    transition:
                        border-color 0.2s ease,
                        background 0.2s ease;
                }

                .formGroup input::placeholder {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.3
                    );
                }

                .formGroup input:focus {
                    border-color: rgba(
                        220,
                        30,
                        30,
                        0.75
                    );
                    background: rgba(
                        255,
                        255,
                        255,
                        0.07
                    );
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

                .showPasswordButton {
                    position: absolute;
                    right: 10px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 0;
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.55
                    );
                    cursor: pointer;
                    font-size: 13px;
                }

                .showPasswordButton:hover {
                    color: #ffffff;
                }

                .forgotButton {
                    border: 0;
                    padding: 0;
                    background: transparent;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.5
                    );
                    cursor: pointer;
                    font-size: 12px;
                }

                .forgotButton:hover {
                    color: #ffffff;
                }

                .passwordHint {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
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
                    transition:
                        transform 0.2s ease,
                        opacity 0.2s ease;
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
                    color: rgba(
                        255,
                        255,
                        255,
                        0.3
                    );
                    font-size: 12px;
                }

                .loginDivider::before,
                .loginDivider::after {
                    content: "";
                    height: 1px;
                    flex: 1;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.1
                    );
                }

                .loginSwitch {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    flex-wrap: wrap;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.48
                    );
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
                    border: 1px solid
                        rgba(255, 70, 70, 0.25);
                    background: rgba(
                        255,
                        40,
                        40,
                        0.08
                    );
                    color: #ff9b9b;
                }

                .loginMessage {
                    border: 1px solid
                        rgba(80, 200, 140, 0.25);
                    background: rgba(
                        80,
                        200,
                        140,
                        0.08
                    );
                    color: #a8e8c5;
                }

                .loginFooter {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 30px;
                    padding-top: 18px;
                    border-top: 1px solid
                        rgba(255, 255, 255, 0.07);
                    color: rgba(
                        255,
                        255,
                        255,
                        0.25
                    );
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