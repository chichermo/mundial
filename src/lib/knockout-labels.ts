/** Equivalencias entre etiquetas antiguas del fixture y nombres actuales. */
const LABEL_ALIASES: Record<string, string> = {
  "Group A Runners Up": "South Africa",
  "Group B Runners Up": "Canada",
  "Group E Winners": "Germany",
  "Group A/B/C/D/F 3rd Place": "3er A/B/C/D/F",
  "Group F Winners": "Netherlands",
  "Group C Runners Up": "Morocco",
  "Group C Winners": "Brazil",
  "Group F Runners Up": "Japan",
  "Group I Winners": "France",
  "Group C/D/F/G/H 3rd Place": "3er C/D/F/G/H",
  "Group E Runners Up": "Ivory Coast",
  "Group I Runners Up": "Norway",
  "Group A Winners": "Mexico",
  "Group C/E/F/H/I 3rd Place": "3er C/E/F/H/I",
  "Group L Winners": "England",
  "Group E/H/I/J/K 3rd Place": "3er E/H/I/J/K",
  "Group D Winners": "USA",
  "Group B/E/F/I/J 3rd Place": "3er B/E/F/I/J",
  "Group G Winners": "Belgium",
  "Group A/E/H/I/J 3rd Place": "3er A/E/H/I/J",
  "Group K Runners Up": "Congo DR",
  "Group L Runners Up": "Croatia",
  "Group H Winners": "Spain",
  "Group J Runners Up": "Algeria",
  "Group B Winners": "Switzerland",
  "Group E/F/G/I/J 3rd Place": "3er E/F/G/I/J",
  "Group J Winners": "Argentina",
  "Group H Runners Up": "Uruguay",
  "Group K Winners": "Colombia",
  "Group D/E/I/J/L 3rd Place": "3er D/E/I/J/L",
  "Group D Runners Up": "Australia",
  "Group G Runners Up": "Egypt",
};

export function normalizeKnockoutLabel(label: string): string {
  return LABEL_ALIASES[label.trim()] ?? label.trim();
}

export function knockoutLabelsMatch(picked: string, official: string): boolean {
  const a = normalizeKnockoutLabel(picked);
  const b = normalizeKnockoutLabel(official);
  return a === b;
}
