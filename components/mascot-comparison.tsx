"use client";

import { Mascot } from "page-mascot";
import { SmoothMascot } from "./smooth-mascot";

const sheets = {
  directions: "/mascots/utkarsh-directions.webp",
  reactions: "/mascots/utkarsh-reactions.webp",
  size: 140,
};

export default function MascotComparison() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      <section className="space-y-3">
        <h2 className="font-medium">Original tracking</h2>
        <Mascot {...sheets} label="original mascot" />
        <p className="text-sm text-muted-foreground">Instant direction changes.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-medium">Smoothed nine poses</h2>
        <SmoothMascot {...sheets} label="smoothed mascot" />
        <p className="text-sm text-muted-foreground">Eased turns, stable boundaries, and a softer return to center.</p>
      </section>
      <section className="space-y-3">
        <h2 className="font-medium">Smoothed 25 poses</h2>
        <SmoothMascot
          directions="/mascots/utkarsh-smooth-directions.webp"
          reactions="/mascots/utkarsh-smooth-reactions.webp"
          directionGrid={5}
          size={140}
          label="25-pose mascot"
        />
        <p className="text-sm text-muted-foreground">Intermediate head turns, eased tracking, and the original expressions.</p>
      </section>
    </div>
  );
}
