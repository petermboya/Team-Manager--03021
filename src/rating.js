// Percentage rounded to a whole number, or null when nothing was attempted
export function pct(made, total) {
  return total > 0 ? Math.round((made / total) * 100) : null;
}

// "28/30 (93%)" or "-" when nothing was attempted
export function formatRatio(made, total) {
  return total > 0 ? `${made}/${total} (${pct(made, total)}%)` : "-";
}

// Shot accuracy = shots on target out of all shots (on target + off target + blocked)
export function shotAccuracy(s) {
  const total = (s.shotsOnTarget || 0) + (s.shotsOffTarget || 0) + (s.blockedShots || 0);
  return formatRatio(s.shotsOnTarget || 0, total);
}

// Match rating from 0 to 10 (1 decimal). Everyone starts on 6.0.
export function calcRating(stats) {
  const n = (key) => Number(stats[key]) || 0;
  let r = 6;

  // Adds
  r += n("goals") * 1;
  r += n("assists") * 0.7;
  r += n("bigChancesCreated") * 0.3;
  r += n("chancesCreated") * 0.15;
  r += n("shotsOnTarget") * 0.1;
  r += n("dribblesMade") * 0.1;
  r += (n("tackles") + n("interceptions") + n("blocks")) * 0.1;
  r += (n("clearances") + n("defensiveContributions")) * 0.05;
  r += Math.min(n("passesFinalThird") * 0.03, 0.3);
  r += Math.min(n("lineBreakingPasses") * 0.05, 0.3);
  r += Math.min(n("recoveries") * 0.03, 0.3);
  r += n("wasFouled") * 0.05;

  // Pass accuracy only counts when at least 10 passes were attempted
  if (n("passesAttempted") >= 10) {
    r += ((n("passesMade") / n("passesAttempted")) * 100 - 75) * 0.02;
  }

  // Duels: won minus lost, across ground and aerial
  const won = n("groundDuelsWon") + n("aerialDuelsWon");
  const total = n("groundDuelsTotal") + n("aerialDuelsTotal");
  r += (won - (total - won)) * 0.04;

  // Takes away
  r -= n("bigChancesMissed") * 0.4;
  r -= n("dispossessed") * 0.1;
  r -= n("dribbledPast") * 0.1;
  r -= n("foulsCommitted") * 0.1;
  r -= n("shotsOffTarget") * 0.05;
  r -= n("blockedShots") * 0.03;

  return Math.round(Math.min(10, Math.max(0, r)) * 10) / 10;
}

// Form = average of all match ratings (1 decimal), or null if there are none
export function calcForm(ratings) {
  if (ratings.length === 0) return null;
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return Math.round((total / ratings.length) * 10) / 10;
}
