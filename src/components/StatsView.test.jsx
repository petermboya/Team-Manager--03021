import { render, screen } from "@testing-library/react";
import StatsView from "./StatsView";

const performance = {
  rating: 7.7,
  goals: 1,
  assists: 1,
  passesMade: 28,
  passesAttempted: 30,
  shotsOnTarget: 1,
  shotsOffTarget: 3,
  blockedShots: 1,
};

test("shows the rating and the grouped stats", () => {
  render(<StatsView performance={performance} />);
  expect(screen.getByText("7.7")).toBeInTheDocument();
  expect(screen.getByText("Passing")).toBeInTheDocument();
  expect(screen.getByText("Duels")).toBeInTheDocument();
  expect(screen.getByText("28/30 (93%)")).toBeInTheDocument();
  expect(screen.getByText("1/5 (20%)")).toBeInTheDocument();
});

test("missing stats show as 0 or a dash", () => {
  render(<StatsView performance={{ rating: 6 }} />);
  expect(screen.getByText("Tackles")).toBeInTheDocument();
  expect(screen.getAllByText("-").length).toBeGreaterThan(0);
});
