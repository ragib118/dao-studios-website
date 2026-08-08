"use client";

import {
    useEffect,
    useRef,
    type KeyboardEvent,
    type RefObject,
    type TouchEvent,
    type WheelEvent,
} from "react";

import useScrollLock from "./useScrollLock";

const focusableSelector = [
    'button:not([disabled])',
    'input:not([disabled])',
    '[href]',
    '[tabindex]:not([tabindex="-1"])',
].join(",");

type UseOverlayDialogOptions = {
    isOpen: boolean;
    onClose: () => void;
    initialFocusRef: RefObject<HTMLElement | null>;
};

export function useOverlayDialog({
    isOpen,
    onClose,
    initialFocusRef,
}: UseOverlayDialogOptions) {

    const overlayRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    useScrollLock(isOpen);

    useEffect(() => {

        if (!isOpen) return;

        initialFocusRef.current?.focus();

    }, [isOpen, initialFocusRef]);

    const handleKeyDown = (
        event: KeyboardEvent<HTMLDivElement>
    ) => {

        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== "Tab") {

            const overlay = overlayRef.current;
            const target = event.target;

            const isTextInput =
                target instanceof HTMLInputElement;

            const isButton =
                target instanceof HTMLButtonElement;

            if (!overlay) return;

            if (
                ["PageDown", "PageUp", "Home", "End"].includes(event.key)
            ) {

                event.preventDefault();

                if (
                    event.key === "Home" ||
                    event.key === "End"
                ) {

                    overlay.scrollTo({
                        top:
                            event.key === "Home"
                                ? 0
                                : overlay.scrollHeight,
                    });

                    return;

                }

                overlay.scrollBy({
                    top:
                        (event.key === "PageDown"
                            ? 1
                            : -1) *
                        overlay.clientHeight *
                        0.8,
                });

                return;

            }

            if (
                !isTextInput &&
                !isButton &&
                ["ArrowDown", "ArrowUp", " "].includes(event.key)
            ) {

                event.preventDefault();

                overlay.scrollBy({
                    top:
                        event.key === " "
                            ? overlay.clientHeight * 0.8
                            : event.key === "ArrowDown"
                            ? 56
                            : -56,
                });

            }

            return;

        }

        const focusableElements =
            dialogRef.current?.querySelectorAll<HTMLElement>(
                focusableSelector
            );

        if (!focusableElements?.length) {

            event.preventDefault();

            return;

        }

        const first = focusableElements[0];
        const last =
            focusableElements[
                focusableElements.length - 1
            ];

        if (
            event.shiftKey &&
            document.activeElement === first
        ) {

            event.preventDefault();

            last.focus();

        } else if (
            !event.shiftKey &&
            document.activeElement === last
        ) {

            event.preventDefault();

            first.focus();

        }

    };

    const stopScrollPropagation = (
        event:
            | WheelEvent<HTMLDivElement>
            | TouchEvent<HTMLDivElement>
    ) => {

        event.stopPropagation();

    };

    return {
        dialogRef,
        overlayRef,
        handleKeyDown,
        stopScrollPropagation,
    };

}