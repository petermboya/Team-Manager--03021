import { render, screen, fireEvent } from "@testing-library/react";
import InjuryForm from "./InjuryForm";

const player = { id: 1, name: "Sam Otieno" };

function fillInjury() {
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Injured" } });
  fireEvent.change(screen.getByLabelText("Injury name"), { target: { value: "Hamstring strain" } });
  fireEvent.change(screen.getByLabelText("Date injured"), { target: { value: "2026-11-01" } });
  fireEvent.change(screen.getByLabelText("Expected return date"), { target: { value: "2026-11-20" } });
}

test("injury fields only show when the player is not match fit", () => {
  render(<InjuryForm player={player} onSave={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getByText("Update fitness: Sam Otieno")).toBeInTheDocument();
  expect(screen.queryByLabelText("Injury name")).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Recovering" } });
  expect(screen.getByLabelText("Injury name")).toBeInTheDocument();
});

test("saves an injury", () => {
  const onSave = vi.fn().mockResolvedValue();
  render(<InjuryForm player={player} onSave={onSave} onCancel={vi.fn()} />);
  fillInjury();
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(onSave).toHaveBeenCalledWith({
    status: "Injured",
    injuryName: "Hamstring strain",
    dateInjured: "2026-11-01",
    expectedReturn: "2026-11-20",
  });
});

test("match fit clears the injury details", () => {
  const onSave = vi.fn().mockResolvedValue();
  const injury = { id: 3, playerId: 1, status: "Injured", injuryName: "Ankle", dateInjured: "2026-11-01", expectedReturn: "2026-11-10" };
  render(<InjuryForm player={player} injury={injury} onSave={onSave} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Match fit" } });
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(onSave).toHaveBeenCalledWith({ status: "Match fit", injuryName: "", dateInjured: "", expectedReturn: "" });
});

test("rejects a return date before the injury date", () => {
  const onSave = vi.fn();
  render(<InjuryForm player={player} onSave={onSave} onCancel={vi.fn()} />);
  fillInjury();
  fireEvent.change(screen.getByLabelText("Expected return date"), { target: { value: "2026-10-01" } });
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(screen.getByText("Expected return can't be before the date injured.")).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

test("shows an error when saving fails", async () => {
  const onSave = vi.fn().mockRejectedValue(new Error("Request failed."));
  render(<InjuryForm player={player} onSave={onSave} onCancel={vi.fn()} />);
  fillInjury();
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("cancel calls onCancel", () => {
  const onCancel = vi.fn();
  render(<InjuryForm player={player} onSave={vi.fn()} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalled();
});
