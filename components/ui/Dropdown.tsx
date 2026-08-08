"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type DropdownOption = {
    value: string;
    label: string;
};

type DropdownProps = {
    label: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
};

export default function Dropdown({
    label,
    value,
    options,
    onChange,
}: DropdownProps) {

    const [open, setOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        function handleClickOutside(e: MouseEvent) {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }

        }

        function handleEscape(e: KeyboardEvent) {

            if (e.key === "Escape") {
                setOpen(false);
            }

        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        };

    }, []);

    const selected =
        options.find(
            option => option.value === value
        ) || options[0];

    return (

        <div
            className="daoDropdown"
            ref={dropdownRef}
        >

            <span className="daoDropdown__label">
                {label}
            </span>

            <button
                type="button"
                className="daoDropdown__button"
                onClick={() => setOpen(prev => !prev)}
            >

                <span>
                    {selected.label}
                </span>

                <motion.span
                    animate={{
                        rotate: open ? 180 : 0,
                    }}
                    transition={{
                        duration: .25,
                    }}
                >
                    ▼
                </motion.span>

            </button>

            <AnimatePresence>

                {open && (

                    <motion.div
                        className="daoDropdown__menu"
                        data-lenis-prevent

                        onWheel={(e) => {
                            e.stopPropagation();
                        }}

                        onTouchMove={(e) => {
                            e.stopPropagation();
                        }}

                        initial={{
                            opacity: 0,
                            y: -8,
                            scale: .98,
                        }}

                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}

                        exit={{
                            opacity: 0,
                            y: -8,
                            scale: .98,
                        }}

                        transition={{
                            duration: .18,
                        }}
                    >

                        {options.map(option => (

                            <button
                                key={option.value}
                                type="button"
                                className={
                                    option.value === value
                                        ? "daoDropdown__item active"
                                        : "daoDropdown__item"
                                }
                                onClick={() => {

                                    onChange(option.value);

                                    setOpen(false);

                                }}
                            >

                                {option.label}

                            </button>

                        ))}

                    </motion.div>

                )}

            </AnimatePresence>

        </div>

    );

}