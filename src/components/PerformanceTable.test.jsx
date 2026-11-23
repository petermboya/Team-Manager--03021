import { render, screen, fireEvent } from "@testing-library/react";
import PerformanceTable from "./PerformanceTable";

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9 };
const jo = { id: 2, name: "Jo Kamau", shirtNumber: 1 };
const performance = { id: 7, minutesPlayed: 90, goals: 1, assists: 1, passesMade: 28, passesAttempted: 30, rating: 7.7 };

test("shows a message when there are no players", () => {
  render(<PerformanceTable rows={[]} />);
  expect(screen.getByText(/No players yet/)).toBeInTheDocument();
});

test("shows stats, rating and form", () => {
  render(<PerformanceTable rows={[{ player: sam, performance, form: 7.5 }, { player: jo, performance: undefined, form: null }]} />);
  expect(screen.getByText("28/30 (93%)")).toBeInTheDocument();
  expect(screen.getByText("7.7")).toBeInTheDocument();
  expect(screen.getByText("7.5")).toBeInTheDocument();
  expect(screen.getByText("Not logged")).toBeInTheDocument();
});

test("has no action buttons unless logging is allowed", () => {
  render(<PerformanceTable rows={[{ player: sam, performance, form: 7.7 }]} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

test("log, edit and delete buttons pass the right thing back", () => {
  const onLog = vi.fn();
  const onDelete = vi.fn();
  render(
    <PerformanceTable
      rows={[{ player: sam, performance, form: 7.7 }, { player: jo, performance: undefined, form: null }]}
      onLog={onLog}
      onDelete={onDelete}
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("button", { name: "Log stats" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(onLog).toHaveBeenCalledWith(sam);
  expect(onLog).toHaveBeenCalledWith(jo);
  expect(onDelete).toHaveBeenCalledWith(performance);
});
