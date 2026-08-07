"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { lenis } from "@/components/SmoothScroll";

const trendingItems = ["PUKU", "Leo & Mochi", "Bubu Crab", "Ocean Legends"];

const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    '[href]',
    '[tabindex]:not([tabindex="-1"])',
].join(",");

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
    const overlayRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState("");
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matchingTitles = useMemo(
        () =>
            normalizedQuery
                ? trendingItems.filter((item) =>
                      item.toLocaleLowerCase().includes(normalizedQuery),
                  )
                : [],
        [normalizedQuery],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const scrollPosition = {
            x: window.scrollX,
            y: window.scrollY,
        };
        const root = document.documentElement;
        const body = document.body;
        const previousRootStyles = {
            overflow: root.style.overflow,
            overscrollBehavior: root.style.overscrollBehavior,
        };
        const previousBodyStyles = {
            overflow: body.style.overflow,
            position: body.style.position,
            top: body.style.top,
            left: body.style.left,
            width: body.style.width,
            paddingRight: body.style.paddingRight,
        };
        const scrollbarWidth = window.innerWidth - root.clientWidth;
        const wasLenisStopped = lenis?.isStopped;

        lenis?.stop();
        root.style.overflow = "hidden";
        root.style.overscrollBehavior = "none";
        body.style.overflow = "hidden";
        body.style.position = "fixed";
        body.style.top = `-${scrollPosition.y}px`;
        body.style.left = `-${scrollPosition.x}px`;
        body.style.width = "100%";

        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${scrollbarWidth}px`;
        }

        inputRef.current?.focus();

        return () => {
            root.style.overflow = previousRootStyles.overflow;
            root.style.overscrollBehavior = previousRootStyles.overscrollBehavior;
            body.style.overflow = previousBodyStyles.overflow;
            body.style.position = previousBodyStyles.position;
            body.style.top = previousBodyStyles.top;
            body.style.left = previousBodyStyles.left;
            body.style.width = previousBodyStyles.width;
            body.style.paddingRight = previousBodyStyles.paddingRight;
            window.scrollTo(scrollPosition.x, scrollPosition.y);

            if (!wasLenisStopped) {
                lenis?.start();
            }
        };
    }, [isOpen]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== "Tab") {
            const target = event.target;
            const isTextInput = target instanceof HTMLInputElement;
            const isButton = target instanceof HTMLButtonElement;
            const scrollableKeys = ["PageDown", "PageUp", "Home", "End"];

            if (scrollableKeys.includes(event.key)) {
                const overlay = overlayRef.current;

                if (!overlay) {
                    return;
                }

                event.preventDefault();

                if (event.key === "Home" || event.key === "End") {
                    overlay.scrollTo({
                        top: event.key === "Home" ? 0 : overlay.scrollHeight,
                    });
                    return;
                }

                overlay.scrollBy({
                    top: (event.key === "PageDown" ? 1 : -1) * overlay.clientHeight * 0.8,
                });
                return;
            }

            if (
                !isTextInput &&
                !isButton &&
                ["ArrowDown", "ArrowUp", " "].includes(event.key)
            ) {
                event.preventDefault();
                overlayRef.current?.scrollBy({
                    top:
                        event.key === " "
                            ? overlayRef.current.clientHeight * 0.8
                            : event.key === "ArrowDown"
                              ? 56
                              : -56,
                });
            }

            return;
        }

        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
            focusableSelector,
        );

        if (!focusableElements?.length) {
            event.preventDefault();
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    };

    return (
        <AnimatePresence onExitComplete={() => triggerRef.current?.focus()}>
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    className="searchOverlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            onClose();
                        }
                    }}
                    onWheel={(event) => event.stopPropagation()}
                    onTouchMove={(event) => event.stopPropagation()}
                >
                        <motion.div
                        ref={dialogRef}
                        id="site-search-dialog"
                        className="searchOverlayPanel"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="search-overlay-title"
                        tabIndex={-1}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.98 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
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
                                <h2 id="search-overlay-title">Search DAO Studios</h2>
                                <p>Find series, shorts and upcoming originals.</p>
                            </div>

                            <div className="searchInputShell">
                                <svg
                                    aria-hidden="true"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                >
                                    <circle cx="11" cy="11" r="6.5" />
                                    <path d="m16 16 4 4" />
                                </svg>

                                <input
                                    ref={inputRef}
                                    id="site-search"
                                    type="search"
                                    aria-label="Search DAO Studios"
                                    placeholder="Search for series, shorts..."
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                />
                            </div>

                            <section className="searchTrending" aria-labelledby="trending-title">
                                <h2 id="trending-title">
                                    {normalizedQuery ? "Suggestions" : "Trending"}
                                </h2>

                                {normalizedQuery && matchingTitles.length === 0 ? (
                                    <p className="searchNoResults" role="status">
                                        No matching titles found.
                                    </p>
                                ) : (
                                    <ul aria-live={normalizedQuery ? "polite" : undefined}>
                                        {(normalizedQuery ? matchingTitles : trendingItems).map(
                                            (item) => (
                                                <li key={item}>
                                                    <button type="button">{item}</button>
                                                </li>
                                            ),
                                        )}
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
