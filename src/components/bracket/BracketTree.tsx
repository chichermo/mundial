"use client";

import type { MatchPhase } from "@/lib/matches-data";
import type { BracketMatchResult } from "@/lib/knockout-bracket";
import type { KnockoutPickData } from "@/lib/knockout-predict";
import { phaseLabel, splitBracketHalves } from "@/lib/knockout-rounds";
import { BracketMatchNode } from "./BracketMatchNode";

type Props = {
  phase: MatchPhase;
  results: Record<number, BracketMatchResult | undefined>;
  picks: Record<number, KnockoutPickData>;
  interactive?: boolean;
  onSave?: (matchId: number, home: number, away: number, winnerLabel?: string) => Promise<void>;
  archived?: boolean;
};

export function BracketTree({ phase, results, picks, interactive, onSave, archived }: Props) {
  const { left, right } = splitBracketHalves(phase);
  const canInteract = interactive && !archived;

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        archived
          ? "border-pitch-mid/40 bg-pitch/40"
          : "border-gold/30 bg-gradient-to-b from-pitch-light/80 via-pitch to-pitch"
      }`}
    >
      <div className="border-b border-pitch-mid/50 bg-pitch-mid/30 px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
          {archived ? "Archivo · " : ""}Fase eliminatoria
        </p>
        <h3 className="font-display text-lg text-gold sm:text-xl">{phaseLabel(phase)}</h3>
      </div>

      <div className="relative grid grid-cols-[1fr_auto_1fr] gap-2 p-3 sm:gap-4 sm:p-6">
        {/* Conectores decorativos */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <div className="absolute left-[25%] top-[8%] h-[84%] w-px bg-gold/20" />
          <div className="absolute right-[25%] top-[8%] h-[84%] w-px bg-gold/20" />
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {left.map((id) => (
            <BracketMatchNode
              key={id}
              matchId={id}
              results={results}
              pick={picks[id]}
              interactive={canInteract}
              onSave={onSave}
            />
          ))}
        </div>

        <div className="flex flex-col items-center justify-center px-1 sm:px-3">
          <div className="text-4xl sm:text-5xl" aria-hidden>
            🏆
          </div>
          <p className="mt-1 hidden text-[10px] uppercase tracking-wider text-gold sm:block">
            WE26
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {right.map((id) => (
            <BracketMatchNode
              key={id}
              matchId={id}
              results={results}
              pick={picks[id]}
              interactive={canInteract}
              onSave={onSave}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
