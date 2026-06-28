import { teamFlag, teamFlagUrl, teamShortName } from "@/lib/team-flags";

type Props = {
  team: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  alt?: string;
};

const SIZE_PX = { sm: 40, md: 56, lg: 72 } as const;
const CDN_SIZE = { sm: 40, md: 80, lg: 160 } as const;

export function TeamFlag({ team, size = "md", className = "", alt }: Props) {
  const px = SIZE_PX[size];
  const url = teamFlagUrl(team, CDN_SIZE[size]);
  const label = alt ?? teamShortName(team);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={label}
        width={px}
        height={Math.round(px * 0.75)}
        className={`rounded object-cover shadow-sm ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center text-2xl ${className}`}
      role="img"
      aria-label={label}
    >
      {teamFlag(team)}
    </span>
  );
}
