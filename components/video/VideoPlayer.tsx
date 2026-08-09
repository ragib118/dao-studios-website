"use client";

import { useEffect, useState } from "react";

type VideoPlayerProps = {
    src: string;
    title?: string;
    onClose: () => void;
};

function getYouTubeId(url: string) {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtube.com")) {
            // YouTube Shorts
            if (parsed.pathname.startsWith("/shorts/")) {
                return parsed.pathname
                    .split("/shorts/")[1]
                    ?.split("/")[0];
            }

            // Normal YouTube video
            if (parsed.pathname === "/watch") {
                return parsed.searchParams.get("v");
            }

            // YouTube embed
            if (parsed.pathname.startsWith("/embed/")) {
                return parsed.pathname
                    .split("/embed/")[1]
                    ?.split("/")[0];
            }
        }

        // youtu.be/VIDEO_ID
        if (parsed.hostname === "youtu.be") {
            return parsed.pathname.slice(1);
        }

        return null;
    } catch {
        return null;
    }
}

function isYouTubeShort(url: string) {
    try {
        const parsed = new URL(url);

        return (
            parsed.hostname.includes("youtube.com") &&
            parsed.pathname.startsWith("/shorts/")
        );
    } catch {
        return false;
    }
}

export default function VideoPlayer({
    src,
    title = "DAO Studios",
    onClose,
}: VideoPlayerProps) {
    const youtubeId = getYouTubeId(src);

    const isShort = isYouTubeShort(src);

    const orientation = isShort
        ? "vertical"
        : "horizontal";

    const [isFullscreen, setIsFullscreen] =
        useState(false);

    /*
     * Detect when YouTube enters/exits fullscreen.
     */
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(
                Boolean(document.fullscreenElement)
            );
        };

        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    /*
     * ESC closes the DAO player only when
     * we are not already in fullscreen.
     */
    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (
                event.key === "Escape" &&
                !document.fullscreenElement
            ) {
                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [onClose]);

    /*
     * Unsupported source.
     */
    if (!youtubeId) {
        return (
            <div className="videoPlayerOverlay">
                <div className="videoPlayerError">
                    <strong>
                        Video unavailable
                    </strong>

                    <span>
                        This video source is not
                        supported.
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="videoPlayerOverlay">
            <div
                className={`videoPlayer videoPlayer--${orientation} ${
                    isFullscreen
                        ? "videoPlayer--fullscreen"
                        : ""
                }`}
            >
                {/* =========================
                    YOUTUBE VIDEO
                ========================== */}

                <iframe
                    className="videoPlayerYouTube"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    title={title}
                    allow="
                        accelerometer;
                        autoplay;
                        clipboard-write;
                        encrypted-media;
                        gyroscope;
                        picture-in-picture;
                        fullscreen;
                        web-share
                    "
                    allowFullScreen
                />

                {/* =========================
                    DAO CLOSE BUTTON
                ========================== */}

                <button
                    type="button"
                    className="videoPlayerClose"
                    onClick={onClose}
                    aria-label="Close video player"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}