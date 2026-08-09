"use client";

import Image from "next/image";
import { useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { series } from "@/data/series";
import { useOverlayDialog } from "@/components/layout/useOverlayDialog";

type SeriesOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    triggerRef: RefObject<HTMLButtonElement | null>;
};

export default function SeriesOverlay({
    isOpen,
    onClose,
    triggerRef,
}: SeriesOverlayProps) {

    const router = useRouter();

    const closeButtonRef =
        useRef<HTMLButtonElement>(null);

    const {
        dialogRef,
        handleKeyDown,
        overlayRef,
        stopScrollPropagation,
    } = useOverlayDialog({
        isOpen,
        onClose,
        initialFocusRef: closeButtonRef,
    });

    const openSeries = (slug: string) => {
        router.push(`/series/${slug}`);
        onClose();
    };

    return (
        <AnimatePresence
            onExitComplete={() =>
                triggerRef.current?.focus()
            }
        >
            {isOpen && (
                <motion.div
                    ref={overlayRef}
                    className="searchOverlay seriesOverlayDialog"

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    exit={{ opacity: 0 }}

                    transition={{
                        duration: 0.3,
                        ease: "easeOut",
                    }}

                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            onClose();
                        }
                    }}

                    onWheel={stopScrollPropagation}

                    onTouchMove={stopScrollPropagation}
                >

                    <motion.div
                        ref={dialogRef}

                        id="series-overlay-dialog"

                        className="searchOverlayPanel seriesOverlayPanel"

                        role="dialog"

                        aria-modal="true"

                        aria-labelledby="series-overlay-title"

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
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                event.currentTarget.focus();
                            }
                        }}
                    >

                        <button
                            ref={closeButtonRef}

                            type="button"

                            className="searchOverlayClose"

                            onClick={onClose}

                            aria-label="Close series"
                        >
                            &times;
                        </button>


                        <div className="searchOverlayIntro">

                            <h2 id="series-overlay-title">
                                Our Series
                            </h2>

                            <p>
                                Original worlds created by DAO Studios.
                            </p>

                        </div>


                        <div className="seriesOverlayGrid">

                            {series.map((item) => (

                                <button
                                    key={item.slug}

                                    type="button"

                                    className="seriesOverlayCard"

                                    aria-label={`Open ${item.title}`}

                                    onClick={() =>
                                        openSeries(item.slug)
                                    }
                                >

                                    <Image
                                        src={item.assets.poster}

                                        alt={item.title}

                                        fill

                                        sizes="
                                            (max-width: 500px) 72vw,
                                            (max-width: 700px) 45vw,
                                            (max-width: 1000px) 30vw,
                                            220px
                                        "
                                    />


                                    <span className="seriesOverlayCardShade" />


                                    <span className="seriesOverlayBadge">
                                        DAO Original
                                    </span>


                                    <span className="seriesOverlayTitle">
                                        {item.title}
                                    </span>

                                </button>

                            ))}

                        </div>

                    </motion.div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}