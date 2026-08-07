"use client";

import {
    useEffect,
    useRef,
    type KeyboardEvent,
    type RefObject,
    type TouchEvent,
    type WheelEvent,
} from "react";
import { lenis } from "@/components/SmoothScroll";

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

    useEffect(() => {
        if (!isOpen) return;

        const scrollPosition = { x: window.scrollX, y: window.scrollY };
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
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

        initialFocusRef.current?.focus();

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
            if (!wasLenisStopped) lenis?.start();
        };
    }, [initialFocusRef, isOpen]);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
            return;
        }

        if (event.key !== "Tab") {
            const overlay = overlayRef.current;
            const target = event.target;
            const isTextInput = target instanceof HTMLInputElement;
            const isButton = target instanceof HTMLButtonElement;

            if (!overlay) return;

            if (["PageDown", "PageUp", "Home", "End"].includes(event.key)) {
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

    const stopScrollPropagation = (
        event: WheelEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
    ) => event.stopPropagation();

    return { dialogRef, handleKeyDown, overlayRef, stopScrollPropagation };
}
