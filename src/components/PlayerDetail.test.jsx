import { render, screen, fireEvent } from "@testing-library/react";
import PlayerDetail from "./PlayerDetail";

const player = { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward", dob: "2000-01-01", height: 180, weight: 75, nationality: "Kenyan", preferredFoot: "Right" };
const matches = [
  { id: 1, number: 1, opponent: "Rivals FC", date: "2026-11-08" },
  { id: 2, number: 2, opponent: "City FC", date: "2026-11-15" },
];
const performances = [
  { id: 10, matchId: 2, playerId: 1, minutesPlayed: 80, goals: 2, assists: 0, passesMade: 28, passesAttempted: 30, rating: 8.2 },
  { id: 11, matchId: 1, playerId: 1, minutesPlayed: 90, goals: 0, assists: 1, passesMade: 10, passesAttempted: 20, rating: 6.4 },
];
const injury = { id: 5, playerId: 1, status: "Injured", injuryName: "Hamstring strain", dateInjured: "2026-11-11", expectedReturn: "2099-01-01" };

test("shows bio, fitness and performance", () => {
  render(<PlayerDetail player={player} injury={injury} performances={performances} matches={matches} onClose={vi.fn()} />);
  expect(screen.getByText("#9 Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Kenyan")).toBeInTheDocument();
  expect(screen.getByText("Hamstring strain")).toBeInTheDocument();
  expect(screen.getByText("Match 1")).toBeInTheDocument();
  expect(screen.getByText("Match 2")).toBeInTheDocument();
  expect(screen.getByText("(form 7.3)")).toBeInTheDocument();
});

test("shows the latest match stats first and can switch", () => {
  render(<PlayerDetail player={player} performances={performances} matches={matches} onClose={vi.fn()} />);
  expect(screen.getByText("Full stats: Match 2 vs City FC")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: "View stats" })[0]);
  expect(screen.getByText("Full stats: Match 1 vs Rivals FC")).toBeInTheDocument();
});

test("says so when no stats are logged", () => {
  render(<PlayerDetail player={{ ...player, weight: "", nationality: "" }} performances={[]} matches={matches} onClose={vi.fn()} />);
  expect(screen.getByText("No match stats logged yet.")).toBeInTheDocument();
});

test("close calls onClose", () => {
  const onClose = vi.fn();
  render(<PlayerDetail player={player} performances={[]} matches={[]} onClose={onClose} />);
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalled();
});
