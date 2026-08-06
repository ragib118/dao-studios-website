"use client";

import HeroStars from "./HeroStars";
import MediumStars from "./MediumStars";
import TinyStars from "./TinyStars";
import ShootingStar from "./ShootingStar";

type StarFieldProps = {
    playMeteor: boolean;
};

export default function StarField({
    playMeteor,
}: StarFieldProps) {
    return (
        <div className="starField">

            <HeroStars />

            <MediumStars />

            <TinyStars />

            <ShootingStar play={playMeteor} />

        </div>
    );
}