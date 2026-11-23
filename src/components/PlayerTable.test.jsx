import { render, screen, fireEvent } from "@testing-library/react";
import PlayerTable from "./PlayerTable";

const players = [
  { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward", dob: "2000-01-01", height: 180, weight: 75, nationality: "Kenyan", preferredFoot: "Right" },
  { id: 2, name: "Jo Kamau", shirtNumber: 1, position: "Goalkeeper", dob: "1998-05-05", height: 190 },
];

test("shows a message when there are no players", () => {
  render(<PlayerTable players={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getByText(/No players yet/)).toBeInTheDocument();
});

test("lists players and uses dashes for missing optional data", () => {
  render(<PlayerTable players={players} onEdit={vi.fn()} onDelete={vi.fn()} />);
  expect(screen.getByText("Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Jo Kamau")).toBeInTheDocument();
  expect(screen.getAllByText("-").length).toBeGreaterThan(0);
});

test("edit and delete buttons pass the player back", () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(<PlayerTable players={players} onEdit={onEdit} onDelete={onDelete} />);
  fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[0]);
  fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[1]);
  expect(onEdit).toHaveBeenCalledWith(players[0]);
  expect(onDelete).toHaveBeenCalledWith(players[1]);
});
