import { render, screen, fireEvent } from "@testing-library/react";
import SquadSelector from "./SquadSelector";

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward" };
const jo = { id: 2, name: "Jo Kamau", shirtNumber: 1, position: "Goalkeeper" };
const injuries = [{ id: 5, playerId: 2, status: "Injured", injuryName: "Ankle sprain" }];

test("shows a message when there are no players", () => {
  render(<SquadSelector players={[]} injuries={[]} assign={{}} onChange={vi.fn()} />);
  expect(screen.getByText(/No players yet/)).toBeInTheDocument();
});

test("shows each player's fitness and current selection", () => {
  render(<SquadSelector players={[sam, jo]} injuries={injuries} assign={{ 1: "starting" }} onChange={vi.fn()} />);
  expect(screen.getByText("Ankle sprain")).toBeInTheDocument();
  expect(screen.getByLabelText("Selection for Sam Otieno")).toHaveValue("starting");
  expect(screen.getByLabelText("Selection for Jo Kamau")).toHaveValue("");
});

test("changing the selection passes the player and choice back", () => {
  const onChange = vi.fn();
  render(<SquadSelector players={[sam]} injuries={[]} assign={{}} onChange={onChange} />);
  fireEvent.change(screen.getByLabelText("Selection for Sam Otieno"), { target: { value: "sub" } });
  expect(onChange).toHaveBeenCalledWith(sam, "sub");
});

test("warns when a selected player is not match fit", () => {
  render(<SquadSelector players={[jo]} injuries={injuries} assign={{ 2: "sub" }} onChange={vi.fn()} />);
  expect(screen.getByText(/Not match fit \(injured\)/)).toBeInTheDocument();
});

test("no warning for a match fit player or an unselected injured player", () => {
  render(<SquadSelector players={[sam, jo]} injuries={injuries} assign={{ 1: "starting" }} onChange={vi.fn()} />);
  expect(screen.queryByText(/Not match fit/)).not.toBeInTheDocument();
});
