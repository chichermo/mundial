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
  showSocial?: boolean;
};

function BracketColumn({
  matchIds,
  results,
  picks,
  canInteract,
  onSave,
  showSocial,
}: {
  matchIds: number[];
  results: Record<number, BracketMatchResult | undefined>;
  picks: Record<number, KnockoutPickData>;
  canInteract: boolean;
  onSave?: Props["onSave"];
  showSocial?: boolean;
}) {
  return (
    <>
      {matchIds.map((id) => (
        <BracketMatchNode
          key={id}
          matchId={id}
          results={results}
          pick={picks[id]}
          interactive={canInteract}
          onSave={onSave}
          showSocial={showSocial}
        />
      ))}
    </>
  );
}

export function BracketTree({
  phase,
  results,
  picks,
  interactive,
  onSave,
  archived,
  showSocial,
}: Props) {
  const { left, right } = splitBracketHalves(phase);
  const canInteract = Boolean(interactive && !archived);
  const allIds = [...left, ...right];

  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border ${
        archived
          ? "border-pitch-mid/40 bg-pitch/40"
          : "border-gold/30 bg-gradient-to-b from-pitch-light/80 via-pitch to-pitch"
      }`}
    >
      <div className="border-b border-pitch-mid/50 bg-pitch-mid/30 px-3 py-3 text-center sm:px-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted">
          {archived ? "Archivo · " : ""}Fase eliminatoria
        </p>
        <h3 className="font-display text-lg text-gold sm:text-xl">{phaseLabel(phase)}</h3>
      </div>

      {/* Móvil: lista vertical a ancho completo */}
      <div className="flex flex-col gap-3 p-3 sm:gap-4 lg:hidden">
        <BracketColumn
          matchIds={allIds}
          results={results}
          picks={picks}
          canInteract={canInteract}
          onSave={onSave}
          showSocial={showSocial}
        />
      </div>

      {/* Escritorio: cuadro en dos mitades */}
      <div className="relative hidden gap-4 p-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[25%] top-[8%] h-[84%] w-px bg-gold/20" />
          <div className="absolute right-[25%] top-[8%] h-[84%] w-px bg-gold/20" />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <BracketColumn
            matchIds={left}
            results={results}
            picks={picks}
            canInteract={canInteract}
            onSave={onSave}
            showSocial={showSocial}
          />
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <div className="text-5xl" aria-hidden>
            🏆
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gold">WE26</p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <BracketColumn
            matchIds={right}
            results={results}
            picks={picks}
            canInteract={canInteract}
            onSave={onSave}
            showSocial={showSocial}
          />
        </div>
      </div>
    </div>
  );
}
