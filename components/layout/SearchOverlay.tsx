"use client";

import {
    useMemo,
    useRef,
    useState,
    type FormEvent,
    type RefObject,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { series } from "@/data/series";
import { useOverlayDialog } from "@/components/layout/useOverlayDialog";

type SearchOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function SearchOverlay({
    isOpen,
    onClose,
    triggerRef,
}: SearchOverlayProps) {
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    const [query, setQuery] = useState("");

    const normalizedQuery = query.trim().toLocaleLowerCase();

    const matchingSeries = useMemo(() => {
        if (!normalizedQuery) {
            return [];
        }

        return series.filter((item) =>
            item.title
                .toLocaleLowerCase()
                .includes(normalizedQuery)
        );
    }, [normalizedQuery]);

    const openSeries = (slug: string) => {
        onClose();
        router.push(`/series/${slug}`);
    };

    /*
     * SEARCH / ENTER
     *
     * If the typed text matches a series,
     * open the first matching series.
     *
     * Examples:
     * "puku" -> /series/puku
     * "pu"   -> /series/puku
     * "leo"  -> /series/leo-mochi
     */
    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!matchingSeries.length) {
            return;
        }

        openSeries(matchingSeries[0].slug);
    };

    const {
        dialogRef,
        handleKeyDown,
        overlayRef,
        stopScrollPropagation,
    } = useOverlayDialog({
        isOpen,
        onClose,
        initialFocusRef: inputRef,
    });

    return (
        <AnimatePresence
            onExitComplete={() =>
                triggerRef.current?.focus()
            }
        >
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    className="searchOverlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                    onWheel={stopScrollPropagation}
                    onTouchMove={stopScrollPropagation}
                >
                    <motion.div
                        ref={dialogRef}
                        id="site-search-dialog"
                        className="searchOverlayPanel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="search-overlay-title"
                        tabIndex={-1}
                        initial={{
                            opacity: 0,
                            y: 24,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 18,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        onKeyDown={handleKeyDown}
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                event.currentTarget.focus();
                            }
                        }}
                    >
                        <button
                            type="button"
                            className="searchOverlayClose"
                            onClick={onClose}
                            aria-label="Close search"
                        >
                            &times;
                        </button>

                        <div className="searchOverlayContent">
                            <div className="searchOverlayIntro">
                                <h2 id="search-overlay-title">
                                    Search DAO Studios
                                </h2>

                                <p>
                                    Find series, shorts and upcoming originals.
                                </p>
                            </div>

                            {/* SEARCH FORM */}
                            <form
                                className="searchInputShell"
                                onSubmit={handleSearchSubmit}
                            >
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                >
                                    <circle
                                        cx="11"
                                        cy="11"
                                        r="6.5"
                                    />

                                    <path d="m16 16 4 4" />
                                </svg>

                                <input
                                    ref={inputRef}
                                    id="site-search"
                                    type="search"
                                    aria-label="Search DAO Studios"
                                    placeholder="Search for series, shorts..."
                                    value={query}
                                    onChange={(event) =>
                                        setQuery(event.target.value)
                                    }
                                />
                            </form>

                            {/* RESULTS */}
                            <section
                                className="searchTrending"
                                aria-labelledby="trending-title"
                            >
                                <h2 id="trending-title">
                                    {normalizedQuery
                                        ? "Suggestions"
                                        : "Trending"}
                                </h2>

                                {normalizedQuery &&
                                matchingSeries.length === 0 ? (
                                    <p
                                        className="searchNoResults"
                                        role="status"
                                    >
                                        No matching titles found.
                                    </p>
                                ) : (
                                    <ul
                                        aria-live={
                                            normalizedQuery
                                                ? "polite"
                                                : undefined
                                        }
                                    >
                                        {(normalizedQuery
                                            ? matchingSeries
                                            : series
                                        ).map((item) => (
                                            <li key={item.slug}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openSeries(
                                                            item.slug
                                                        )
                                                    }
                                                >
                                                    {item.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}