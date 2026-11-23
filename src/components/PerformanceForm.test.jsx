import { render, screen, fireEvent } from "@testing-library/react";
import PerformanceForm from "./PerformanceForm";

const player = { id: 1, name: "Sam Otieno" };
const match = { id: 1, number: 2, opponent: "Rivals FC" };

function type(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
}

function renderForm(props = {}) {
  const onSave = vi.fn().mockResolvedValue();
  const onCancel = vi.fn();
  render(<PerformanceForm player={player} match={match} onSave={onSave} onCancel={onCancel} {...props} />);
  return { onSave, onCancel };
}

test("shows the player and match", () => {
  renderForm();
  expect(screen.getByText("Log stats: Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Match 2 vs Rivals FC")).toBeInTheDocument();
});

test("shows the calculated rating as you type", () => {
  renderForm();
  expect(screen.getByText("6.0")).toBeInTheDocument();
  type("Goals", 1);
  type("Assists", 1);
  expect(screen.getByText("7.7")).toBeInTheDocument();
});

test("saves the numbers and the rating", () => {
  const { onSave } = renderForm();
  type("Minutes played", 90);
  type("Goals", 1);
  type("Assists", 1);
  type("Accurate passes", 28);
  type("Passes attempted", 30);
  fireEvent.click(screen.getByRole("button", { name: "Save stats" }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ minutesPlayed: 90, goals: 1, assists: 1, passesMade: 28, passesAttempted: 30, tackles: 0 })
  );
  expect(onSave.mock.calls[0][0].rating).toBeGreaterThan(7.7);
});

test("fills in the form when editing existing stats", () => {
  renderForm({ performance: { id: 4, minutesPlayed: 75, goals: 2, rating: 8 } });
  expect(screen.getByLabelText("Minutes played")).toHaveValue(75);
  expect(screen.getByLabelText("Goals")).toHaveValue(2);
});

test("rejects more made than attempted", () => {
  const { onSave } = renderForm();
  type("Minutes played", 90);
  type("Accurate passes", 5);
  type("Passes attempted", 3);
  fireEvent.click(screen.getByRole("button", { name: "Save stats" }));
  expect(screen.getByText("Accurate passes can't be more than passes attempted.")).toBeInTheDocument();
  expect(onSave).not.toHaveBeenCalled();
});

test("shows an error when saving fails", async () => {
  const { onSave } = renderForm();
  onSave.mockRejectedValue(new Error("Request failed."));
  type("Minutes played", 90);
  fireEvent.click(screen.getByRole("button", { name: "Save stats" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("cancel calls onCancel", () => {
  const { onCancel } = renderForm();
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalled();
});
