"use client";

import { useEffect, useState } from "react";

type VideoPlayerProps = {
    src: string;
    title?: string;
    onClose: () => void;
};

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function normalizeYouTubeId(value: string | null) {
    return value && YOUTUBE_ID_PATTERN.test(value) ? value : null;
}

function getYouTubeId(url: string) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();

        if (hostname === "youtube.com" || hostname === "www.youtube.com") {
            if (parsed.pathname.startsWith("/shorts/")) {
                return normalizeYouTubeId(
                    parsed.pathname.split("/shorts/")[1]?.split("/")[0] ?? null
                );
            }

            if (parsed.pathname === "/watch") {
                return normalizeYouTubeId(parsed.searchParams.get("v"));
            }

            if (parsed.pathname.startsWith("/embed/")) {
                return normalizeYouTubeId(
                    parsed.pathname.split("/embed/")[1]?.split("/")[0] ?? null
                );
            }
        }

        if (hostname === "youtu.be") {
            return normalizeYouTubeId(parsed.pathname.slice(1).split("/")[0] ?? null);
        }

        return null;
    } catch {
        return null;
    }
}

function isYouTubeShort(url: string) {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.toLowerCase();

        return (
            (hostname === "youtube.com" || hostname === "www.youtube.com") &&
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
    const orientation = isShort ? "vertical" : "horizontal";

    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !document.fullscreenElement) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    if (!youtubeId) {
        return (
            <div className="videoPlayerOverlay">
                <div className="videoPlayerError">
                    <strong>Video unavailable</strong>
                    <span>This video source is not supported.</span>
                    <button type="button" onClick={onClose}>
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
                    isFullscreen ? "videoPlayer--fullscreen" : ""
                }`}
            >
                <iframe
                    className="videoPlayerYouTube"
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    allowFullScreen
                />

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
