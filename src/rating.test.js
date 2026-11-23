import { pct, formatRatio, shotAccuracy, calcRating, calcForm } from "./rating";
import { toNumbers, ALL_KEYS } from "./statFields";

test("pct rounds and handles zero attempts", () => {
  expect(pct(1, 3)).toBe(33);
  expect(pct(6, 7)).toBe(86);
  expect(pct(0, 0)).toBeNull();
});

test("formatRatio shows made/total and percentage", () => {
  expect(formatRatio(28, 30)).toBe("28/30 (93%)");
  expect(formatRatio(0, 0)).toBe("-");
});

test("shot accuracy uses on target out of all shots", () => {
  expect(shotAccuracy({ shotsOnTarget: 1, shotsOffTarget: 3, blockedShots: 1 })).toBe("1/5 (20%)");
  expect(shotAccuracy({})).toBe("-");
});

test("an empty performance is a 6.0", () => {
  expect(calcRating({})).toBe(6);
});

test("goals and assists add to the rating", () => {
  expect(calcRating({ goals: 1 })).toBe(7);
  expect(calcRating({ goals: 1, assists: 1 })).toBe(7.7);
});

test("pass accuracy counts only with 10 or more passes", () => {
  expect(calcRating({ passesMade: 28, passesAttempted: 30 })).toBe(6.4);
  expect(calcRating({ passesMade: 5, passesAttempted: 5 })).toBe(6);
});

test("poor pass accuracy lowers the rating", () => {
  expect(calcRating({ passesMade: 5, passesAttempted: 10 })).toBe(5.5);
});

test("defending stats add to the rating", () => {
  expect(calcRating({ tackles: 2, interceptions: 1, blocks: 1 })).toBe(6.4);
  expect(calcRating({ clearances: 2, defensiveContributions: 2 })).toBe(6.2);
});

test("creating and shooting stats add to the rating", () => {
  expect(calcRating({ bigChancesCreated: 1, chancesCreated: 2, shotsOnTarget: 1, dribblesMade: 1 })).toBe(6.8);
});

test("duels count won minus lost", () => {
  expect(calcRating({ groundDuelsWon: 8, groundDuelsTotal: 10 })).toBe(6.2);
  expect(calcRating({ aerialDuelsWon: 1, aerialDuelsTotal: 5 })).toBe(5.9);
});

test("mistakes lower the rating", () => {
  expect(calcRating({ dispossessed: 3 })).toBe(5.7);
  expect(calcRating({ bigChancesMissed: 1, foulsCommitted: 1, dribbledPast: 1 })).toBe(5.4);
  expect(calcRating({ shotsOffTarget: 2, blockedShots: 2 })).toBe(5.8);
});

test("some stats are capped", () => {
  expect(calcRating({ passesFinalThird: 100 })).toBe(6.3);
  expect(calcRating({ lineBreakingPasses: 100 })).toBe(6.3);
  expect(calcRating({ recoveries: 100 })).toBe(6.3);
});

test("being fouled adds a little", () => {
  expect(calcRating({ wasFouled: 2 })).toBe(6.1);
});

test("the rating stays between 0 and 10", () => {
  expect(calcRating({ goals: 10 })).toBe(10);
  expect(calcRating({ bigChancesMissed: 20 })).toBe(0);
});

test("form is the average of the ratings", () => {
  expect(calcForm([7, 8])).toBe(7.5);
  expect(calcForm([7.1, 6.2, 8.4])).toBe(7.2);
  expect(calcForm([])).toBeNull();
});

test("toNumbers turns text into numbers and empty into 0", () => {
  const nums = toNumbers({ goals: "2", assists: "" });
  expect(nums.goals).toBe(2);
  expect(nums.assists).toBe(0);
  expect(Object.keys(nums)).toEqual(ALL_KEYS);
});
