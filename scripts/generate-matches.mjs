/** Genera src/data/matches.json desde el calendario oficial WE26 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const groupMatches = [
  [1, "2026-06-11", "15:00", "Mexico", "South Africa", "A", "Estadio Azteca", "Mexico City"],
  [2, "2026-06-11", "22:00", "South Korea", "Czechia", "A", "Estadio Akron", "Guadalajara"],
  [3, "2026-06-12", "15:00", "Canada", "Bosnia and Herzegovina", "B", "BMO Field", "Toronto"],
  [4, "2026-06-12", "21:00", "USA", "Paraguay", "D", "SoFi Stadium", "Los Angeles"],
  [5, "2026-06-13", "21:00", "Haiti", "Scotland", "C", "Gillette Stadium", "Boston"],
  [6, "2026-06-14", "00:00", "Australia", "Turkiye", "D", "BC Place", "Vancouver"],
  [7, "2026-06-13", "18:00", "Brazil", "Morocco", "C", "MetLife Stadium", "New York/New Jersey"],
  [8, "2026-06-13", "15:00", "Qatar", "Switzerland", "B", "Levi's Stadium", "San Francisco Bay Area"],
  [9, "2026-06-14", "19:00", "Ivory Coast", "Ecuador", "E", "Lincoln Financial Field", "Philadelphia"],
  [10, "2026-06-14", "13:00", "Germany", "Curacao", "E", "NRG Stadium", "Houston"],
  [11, "2026-06-14", "16:00", "Netherlands", "Japan", "F", "AT&T Stadium", "Dallas"],
  [12, "2026-06-14", "22:00", "Sweden", "Tunisia", "F", "Estadio BBVA", "Monterrey"],
  [13, "2026-06-15", "18:00", "Saudi Arabia", "Uruguay", "H", "Hard Rock Stadium", "Miami"],
  [14, "2026-06-15", "12:00", "Spain", "Cape Verde", "H", "Mercedes-Benz Stadium", "Atlanta"],
  [15, "2026-06-15", "21:00", "Iran", "New Zealand", "G", "SoFi Stadium", "Los Angeles"],
  [16, "2026-06-15", "15:00", "Belgium", "Egypt", "G", "Lumen Field", "Seattle"],
  [17, "2026-06-16", "15:00", "France", "Senegal", "I", "MetLife Stadium", "New York/New Jersey"],
  [18, "2026-06-16", "18:00", "Iraq", "Norway", "I", "Gillette Stadium", "Boston"],
  [19, "2026-06-16", "21:00", "Argentina", "Algeria", "J", "Arrowhead Stadium", "Kansas City"],
  [20, "2026-06-17", "00:00", "Austria", "Jordan", "J", "Levi's Stadium", "San Francisco Bay Area"],
  [21, "2026-06-17", "19:00", "Ghana", "Panama", "L", "BMO Field", "Toronto"],
  [22, "2026-06-17", "16:00", "England", "Croatia", "L", "AT&T Stadium", "Dallas"],
  [23, "2026-06-17", "13:00", "Portugal", "Congo DR", "K", "NRG Stadium", "Houston"],
  [24, "2026-06-17", "22:00", "Uzbekistan", "Colombia", "K", "Estadio Azteca", "Mexico City"],
  [25, "2026-06-18", "12:00", "Czechia", "South Africa", "A", "Mercedes-Benz Stadium", "Atlanta"],
  [26, "2026-06-18", "15:00", "Switzerland", "Bosnia and Herzegovina", "B", "SoFi Stadium", "Los Angeles"],
  [27, "2026-06-18", "18:00", "Canada", "Qatar", "B", "BC Place", "Vancouver"],
  [28, "2026-06-18", "21:00", "Mexico", "South Korea", "A", "Estadio Akron", "Guadalajara"],
  [29, "2026-06-19", "21:00", "Brazil", "Haiti", "C", "Lincoln Financial Field", "Philadelphia"],
  [30, "2026-06-19", "18:00", "Scotland", "Morocco", "C", "Gillette Stadium", "Boston"],
  [31, "2026-06-19", "23:00", "Turkiye", "Paraguay", "D", "Levi's Stadium", "San Francisco Bay Area"],
  [32, "2026-06-19", "15:00", "USA", "Australia", "D", "Lumen Field", "Seattle"],
  [33, "2026-06-20", "16:00", "Germany", "Ivory Coast", "E", "BMO Field", "Toronto"],
  [34, "2026-06-20", "20:00", "Ecuador", "Curacao", "E", "Arrowhead Stadium", "Kansas City"],
  [35, "2026-06-20", "13:00", "Netherlands", "Sweden", "F", "NRG Stadium", "Houston"],
  [36, "2026-06-21", "00:00", "Tunisia", "Japan", "F", "Estadio BBVA", "Monterrey"],
  [37, "2026-06-21", "18:00", "Uruguay", "Cape Verde", "H", "Hard Rock Stadium", "Miami"],
  [38, "2026-06-21", "12:00", "Spain", "Saudi Arabia", "H", "Mercedes-Benz Stadium", "Atlanta"],
  [39, "2026-06-21", "15:00", "Belgium", "Iran", "G", "SoFi Stadium", "Los Angeles"],
  [40, "2026-06-21", "21:00", "New Zealand", "Egypt", "G", "BC Place", "Vancouver"],
  [41, "2026-06-22", "20:00", "Norway", "Senegal", "I", "MetLife Stadium", "New York/New Jersey"],
  [42, "2026-06-22", "17:00", "France", "Iraq", "I", "Lincoln Financial Field", "Philadelphia"],
  [43, "2026-06-22", "13:00", "Argentina", "Austria", "J", "AT&T Stadium", "Dallas"],
  [44, "2026-06-22", "23:00", "Jordan", "Algeria", "J", "Levi's Stadium", "San Francisco Bay Area"],
  [45, "2026-06-23", "16:00", "England", "Ghana", "L", "Gillette Stadium", "Boston"],
  [46, "2026-06-23", "19:00", "Panama", "Croatia", "L", "BMO Field", "Toronto"],
  [47, "2026-06-23", "13:00", "Portugal", "Uzbekistan", "K", "NRG Stadium", "Houston"],
  [48, "2026-06-23", "22:00", "Colombia", "Congo DR", "K", "Estadio Akron", "Guadalajara"],
  [49, "2026-06-24", "18:00", "Scotland", "Brazil", "C", "Hard Rock Stadium", "Miami"],
  [50, "2026-06-24", "18:00", "Morocco", "Haiti", "C", "Mercedes-Benz Stadium", "Atlanta"],
  [51, "2026-06-24", "15:00", "Switzerland", "Canada", "B", "BC Place", "Vancouver"],
  [52, "2026-06-24", "15:00", "Bosnia and Herzegovina", "Qatar", "B", "Lumen Field", "Seattle"],
  [53, "2026-06-24", "21:00", "Czechia", "Mexico", "A", "Estadio Azteca", "Mexico City"],
  [54, "2026-06-24", "21:00", "South Africa", "South Korea", "A", "Estadio BBVA", "Monterrey"],
  [55, "2026-06-25", "16:00", "Curacao", "Ivory Coast", "E", "Lincoln Financial Field", "Philadelphia"],
  [56, "2026-06-25", "16:00", "Ecuador", "Germany", "E", "MetLife Stadium", "New York/New Jersey"],
  [57, "2026-06-25", "19:00", "Japan", "Sweden", "F", "AT&T Stadium", "Dallas"],
  [58, "2026-06-25", "19:00", "Tunisia", "Netherlands", "F", "Arrowhead Stadium", "Kansas City"],
  [59, "2026-06-25", "22:00", "Turkiye", "USA", "D", "SoFi Stadium", "Los Angeles"],
  [60, "2026-06-25", "22:00", "Paraguay", "Australia", "D", "Levi's Stadium", "San Francisco Bay Area"],
  [61, "2026-06-26", "15:00", "Norway", "France", "I", "Gillette Stadium", "Boston"],
  [62, "2026-06-26", "15:00", "Senegal", "Iraq", "I", "BMO Field", "Toronto"],
  [63, "2026-06-26", "23:00", "Egypt", "Iran", "G", "Lumen Field", "Seattle"],
  [64, "2026-06-26", "23:00", "New Zealand", "Belgium", "G", "BC Place", "Vancouver"],
  [65, "2026-06-26", "20:00", "Cape Verde", "Saudi Arabia", "H", "NRG Stadium", "Houston"],
  [66, "2026-06-26", "20:00", "Uruguay", "Spain", "H", "Estadio Akron", "Guadalajara"],
  [67, "2026-06-27", "17:00", "Panama", "England", "L", "MetLife Stadium", "New York/New Jersey"],
  [68, "2026-06-27", "17:00", "Croatia", "Ghana", "L", "Lincoln Financial Field", "Philadelphia"],
  [69, "2026-06-27", "22:00", "Algeria", "Austria", "J", "Arrowhead Stadium", "Kansas City"],
  [70, "2026-06-27", "22:00", "Jordan", "Argentina", "J", "AT&T Stadium", "Dallas"],
  [71, "2026-06-27", "19:30", "Colombia", "Portugal", "K", "Hard Rock Stadium", "Miami"],
  [72, "2026-06-27", "19:30", "Congo DR", "Uzbekistan", "K", "Mercedes-Benz Stadium", "Atlanta"],
];

const knockoutMatches = [
  [73, "2026-06-28", "15:00", "South Africa", "Canada", null, "SoFi Stadium", "Los Angeles", "round32"],
  [74, "2026-06-29", "16:30", "Germany", "3er A/B/C/D/F", null, "Gillette Stadium", "Boston", "round32"],
  [75, "2026-06-29", "21:00", "Netherlands", "Morocco", null, "Estadio BBVA", "Monterrey", "round32"],
  [76, "2026-06-29", "13:00", "Brazil", "Japan", null, "NRG Stadium", "Houston", "round32"],
  [77, "2026-06-30", "17:00", "France", "3er C/D/F/G/H", null, "MetLife Stadium", "New York/New Jersey", "round32"],
  [78, "2026-06-30", "13:00", "Ivory Coast", "Norway", null, "AT&T Stadium", "Dallas", "round32"],
  [79, "2026-06-30", "21:00", "Mexico", "3er C/E/F/H/I", null, "Estadio Azteca", "Mexico City", "round32"],
  [80, "2026-07-01", "12:00", "England", "3er E/H/I/J/K", null, "Mercedes-Benz Stadium", "Atlanta", "round32"],
  [81, "2026-07-01", "20:00", "USA", "3er B/E/F/I/J", null, "Levi's Stadium", "San Francisco Bay Area", "round32"],
  [82, "2026-07-01", "16:00", "Belgium", "3er A/E/H/I/J", null, "Lumen Field", "Seattle", "round32"],
  [83, "2026-07-02", "19:00", "Congo DR", "Croatia", null, "BMO Field", "Toronto", "round32"],
  [84, "2026-07-02", "15:00", "Spain", "Algeria", null, "SoFi Stadium", "Los Angeles", "round32"],
  [85, "2026-07-02", "23:00", "Switzerland", "3er E/F/G/I/J", null, "BC Place", "Vancouver", "round32"],
  [86, "2026-07-03", "18:00", "Argentina", "Uruguay", null, "Hard Rock Stadium", "Miami", "round32"],
  [87, "2026-07-03", "21:30", "Colombia", "3er D/E/I/J/L", null, "Arrowhead Stadium", "Kansas City", "round32"],
  [88, "2026-07-03", "14:00", "Australia", "Egypt", null, "AT&T Stadium", "Dallas", "round32"],
  [89, "2026-07-04", "17:00", "Match 74 Winner", "Match 77 Winner", null, "Lincoln Financial Field", "Philadelphia", "round16"],
  [90, "2026-07-04", "13:00", "Match 73 Winner", "Match 75 Winner", null, "NRG Stadium", "Houston", "round16"],
  [91, "2026-07-05", "16:00", "Match 76 Winner", "Match 78 Winner", null, "MetLife Stadium", "New York/New Jersey", "round16"],
  [92, "2026-07-05", "20:00", "Match 79 Winner", "Match 80 Winner", null, "Estadio Azteca", "Mexico City", "round16"],
  [93, "2026-07-06", "15:00", "Match 83 Winner", "Match 84 Winner", null, "AT&T Stadium", "Dallas", "round16"],
  [94, "2026-07-06", "20:00", "Match 81 Winner", "Match 82 Winner", null, "Lumen Field", "Seattle", "round16"],
  [95, "2026-07-07", "12:00", "Match 86 Winner", "Match 88 Winner", null, "Mercedes-Benz Stadium", "Atlanta", "round16"],
  [96, "2026-07-07", "16:00", "Match 85 Winner", "Match 87 Winner", null, "BC Place", "Vancouver", "round16"],
  [97, "2026-07-09", "16:00", "Match 89 Winner", "Match 90 Winner", null, "Gillette Stadium", "Boston", "quarter"],
  [98, "2026-07-10", "15:00", "Match 93 Winner", "Match 94 Winner", null, "SoFi Stadium", "Los Angeles", "quarter"],
  [99, "2026-07-11", "17:00", "Match 91 Winner", "Match 92 Winner", null, "Hard Rock Stadium", "Miami", "quarter"],
  [100, "2026-07-11", "21:00", "Match 95 Winner", "Match 96 Winner", null, "Arrowhead Stadium", "Kansas City", "quarter"],
  [101, "2026-07-14", "15:00", "Match 97 Winner", "Match 98 Winner", null, "AT&T Stadium", "Dallas", "semi"],
  [102, "2026-07-15", "15:00", "Match 99 Winner", "Match 100 Winner", null, "Mercedes-Benz Stadium", "Atlanta", "semi"],
  [103, "2026-07-18", "17:00", "Match 101 Loser", "Match 102 Loser", null, "Hard Rock Stadium", "Miami", "third"],
  [104, "2026-07-19", "15:00", "Match 101 Winner", "Match 102 Winner", null, "MetLife Stadium", "New York/New Jersey", "final"],
];

// Chilevisión oficial (chilevision.cl + Sporting News): 52 partidos
// 34 fase de grupos confirmados por CHV
const chilevisionGroup = [
  1, 3, 4, 7, 8, 9, 11, 13, 16, 17, 19, 22, 24, 26, 27, 30, 32, 33, 36, 38, 39, 41, 43, 45, 46, 47, 49, 53, 56, 58, 60, 61, 66, 71,
];
// 9 dieciseisavos + 4 octavos + 2 cuartos + 2 semis + final (18 eliminatoria)
const chilevisionKnockout = [
  73, 74, 76, 78, 79, 81, 84, 86, 88,
  89, 91, 93, 95,
  97, 99,
  101, 102,
  104,
];
const chilevisionIds = new Set([...chilevisionGroup, ...chilevisionKnockout]);

const disneyPlusIds = new Set([
  1, 4, 7, 14, 17, 19, 22, 28, 32, 38, 43, 56, 59, 66, 67, 71,
  74, 78, 84, 87,
  91, 94,
  99, 100,
  101, 102, 104,
]);

function hasTeam(home, away, team) {
  return home === team || away === team;
}

function buildBroadcast(id, phase, home, away) {
  const spain = hasTeam(home, away, "Spain");
  const belgium = hasTeam(home, away, "Belgium");
  const featured =
    id === 1 ||
    id === 104 ||
    phase === "semi" ||
    phase === "final" ||
    phase === "third" ||
    phase === "quarter" ||
    spain ||
    belgium;

  return {
    chile: {
      all: ["DSports", "DGo", "Paramount+"],
      freeTv: chilevisionIds.has(id) ? ["Chilevisión"] : [],
      premium: disneyPlusIds.has(id) ? ["Disney+ Premium"] : [],
    },
    spain: {
      all: ["DAZN", "Movistar+ (DAZN Mundial)"],
      freeTv:
        featured || spain
          ? ["La 1 / Teledeporte", "RTVE Play"]
          : [],
    },
    belgium: {
      all: ["VRT (Eén/Sporza)", "RTBF (La Une)"],
      stream: ["VRT MAX", "RTBF Auvio"],
    },
  };
}

const matches = [
  ...groupMatches.map(([id, date, time, home, away, group, venue, city]) => ({
    id,
    date,
    kickoffEst: time,
    home,
    away,
    group,
    phase: "group",
    venue,
    city,
    broadcast: buildBroadcast(id, "group", home, away),
  })),
  ...knockoutMatches.map(([id, date, time, home, away, group, venue, city, phase]) => ({
    id,
    date,
    kickoffEst: time,
    home,
    away,
    group,
    phase,
    venue,
    city,
    broadcast: buildBroadcast(id, phase, home, away),
  })),
];

const teams = [
  ...new Set(
    groupMatches.flatMap((m) => [m[3], m[4]]).filter((t) => !t.startsWith("Group") && !t.startsWith("Match")),
  ),
].sort();

const outPath = join(__dirname, "../src/data/matches.json");
writeFileSync(outPath, JSON.stringify({ matches, teams }, null, 2));
console.log(`Written ${matches.length} matches to ${outPath}`);
