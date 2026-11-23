import { render, screen, fireEvent } from "@testing-library/react";
import FitnessTable from "./FitnessTable";

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9 };
const jo = { id: 2, name: "Jo Kamau", shirtNumber: 1 };
const injury = { id: 5, playerId: 1, status: "Injured", injuryName: "Hamstring strain", dateInjured: "2026-11-11", expectedReturn: "2026-11-30" };

test("shows a message when there are no players", () => {
  render(<FitnessTable rows={[]} today="2026-11-21" />);
  expect(screen.getByText(/No players yet/)).toBeInTheDocument();
});

test("shows injury details and the timeline", () => {
  render(<FitnessTable rows={[{ player: sam, injury }, { player: jo }]} today="2026-11-21" />);
  expect(screen.getByText("Hamstring strain")).toBeInTheDocument();
  expect(screen.getByText("10 days")).toBeInTheDocument();
  expect(screen.getByText("9 days to go")).toBeInTheDocument();
  // the player with no record counts as match fit
  expect(screen.getByText("Match fit")).toBeInTheDocument();
});

test("has no update button unless editing is allowed", () => {
  render(<FitnessTable rows={[{ player: sam, injury }]} today="2026-11-21" />);
  expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
});

test("update button passes the player back", () => {
  const onEdit = vi.fn();
  render(<FitnessTable rows={[{ player: sam, injury }]} onEdit={onEdit} today="2026-11-21" />);
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  expect(onEdit).toHaveBeenCalledWith(sam);
});
