import { render, screen, fireEvent } from "@testing-library/react";
import OverviewTable from "./OverviewTable";

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward", dob: "2000-01-01" };
const jo = { id: 2, name: "Jo Kamau", shirtNumber: 1, position: "Goalkeeper", dob: "1998-05-05" };

test("shows a message when there are no players", () => {
  render(<OverviewTable rows={[]} onSelect={vi.fn()} />);
  expect(screen.getByText(/No players yet/)).toBeInTheDocument();
});

test("lists players with fitness and form", () => {
  const injury = { status: "Injured" };
  render(<OverviewTable rows={[{ player: sam, injury, form: 7.3 }, { player: jo, form: null }]} onSelect={vi.fn()} />);
  expect(screen.getByText("Injured")).toBeInTheDocument();
  expect(screen.getByText("Match fit")).toBeInTheDocument();
  expect(screen.getByText("7.3")).toBeInTheDocument();
  expect(screen.getByText("-")).toBeInTheDocument();
});

test("view passes the player back", () => {
  const onSelect = vi.fn();
  render(<OverviewTable rows={[{ player: sam, form: null }]} onSelect={onSelect} />);
  fireEvent.click(screen.getByRole("button", { name: "View" }));
  expect(onSelect).toHaveBeenCalledWith(sam);
});
