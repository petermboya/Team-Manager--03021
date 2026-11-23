import { render, screen, fireEvent } from "@testing-library/react";
import MatchForm from "./MatchForm";

test("saves the opponent and date", () => {
  const onSave = vi.fn().mockResolvedValue();
  render(<MatchForm onSave={onSave} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Opponent"), { target: { value: " Rivals FC " } });
  fireEvent.change(screen.getByLabelText("Match date"), { target: { value: "2026-11-15" } });
  fireEvent.click(screen.getByRole("button", { name: "Create match" }));
  expect(onSave).toHaveBeenCalledWith({ opponent: "Rivals FC", date: "2026-11-15" });
});

test("shows an error when saving fails", async () => {
  const onSave = vi.fn().mockRejectedValue(new Error("Request failed."));
  render(<MatchForm onSave={onSave} onCancel={vi.fn()} />);
  fireEvent.change(screen.getByLabelText("Opponent"), { target: { value: "Rivals FC" } });
  fireEvent.click(screen.getByRole("button", { name: "Create match" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("cancel calls onCancel", () => {
  const onCancel = vi.fn();
  render(<MatchForm onSave={vi.fn()} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalled();
});
