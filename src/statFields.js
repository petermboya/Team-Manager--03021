// Every stat the Assistant coach logs. Each group is shown as a section in the form.
// fields: single numbers  [key, label]
// pairs:  made out of total  [madeKey, totalKey, madeLabel, totalLabel]
export const GROUPS = [
  {
    title: "General",
    fields: [
      ["minutesPlayed", "Minutes played"],
      ["goals", "Goals"],
      ["assists", "Assists"],
    ],
  },
  {
    title: "Passing",
    fields: [
      ["chancesCreated", "Chances created"],
      ["bigChancesCreated", "Big chances created"],
      ["passesFinalThird", "Passes into final third"],
      ["lineBreakingPasses", "Line-breaking passes"],
    ],
    pairs: [
      ["passesMade", "passesAttempted", "Accurate passes", "Passes attempted"],
      ["longBallsMade", "longBallsAttempted", "Accurate long balls", "Long balls attempted"],
    ],
  },
  {
    title: "Shooting",
    fields: [
      ["shotsOnTarget", "Shots on target"],
      ["shotsOffTarget", "Shots off target"],
      ["blockedShots", "Blocked shots"],
      ["bigChancesMissed", "Big chances missed"],
    ],
  },
  {
    title: "Possession",
    fields: [
      ["touches", "Touches"],
      ["touchesInBox", "Touches in opposition box"],
      ["dispossessed", "Dispossessed"],
      ["wasFouled", "Was fouled"],
    ],
    pairs: [["dribblesMade", "dribblesAttempted", "Successful dribbles", "Dribbles attempted"]],
  },
  {
    title: "Defending",
    fields: [
      ["defensiveContributions", "Defensive contributions"],
      ["tackles", "Tackles"],
      ["blocks", "Blocks"],
      ["clearances", "Clearances"],
      ["headedClearances", "Headed clearances"],
      ["interceptions", "Interceptions"],
      ["recoveries", "Recoveries"],
      ["dribbledPast", "Dribbled past"],
      ["foulsCommitted", "Fouls committed"],
    ],
  },
  {
    title: "Duels",
    pairs: [
      ["groundDuelsWon", "groundDuelsTotal", "Ground duels won", "Ground duels total"],
      ["aerialDuelsWon", "aerialDuelsTotal", "Aerial duels won", "Aerial duels total"],
    ],
  },
];

export const ALL_KEYS = GROUPS.flatMap((g) => [
  ...(g.fields || []).map(([key]) => key),
  ...(g.pairs || []).flatMap(([made, total]) => [made, total]),
]);

// Turns the form's text values into numbers (empty = 0)
export function toNumbers(values) {
  return Object.fromEntries(ALL_KEYS.map((k) => [k, Number(values[k]) || 0]));
}
