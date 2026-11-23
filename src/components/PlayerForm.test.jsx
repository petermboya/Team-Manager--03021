import { render, screen, fireEvent } from "@testing-library/react";
import PlayerForm from "./PlayerForm";

function fillForm() {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Sam Otieno" } });
  fireEvent.change(screen.getByLabelText("Shirt number"), { target: { value: "9" } });
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "2000-01-01" } });
  fireEvent.change(screen.getByLabelText("Height (cm)"), { target: { value: "180" } });
  fireEvent.change(screen.getByLabelText("Position"), { target: { value: "Forward" } });
}

test("sends the filled in player when saved", () => {
  const onSave = vi.fn().mockResolvedValue();
  render(<PlayerForm player={{}} onSave={onSave} onCancel={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Add player" })).toBeInTheDocument();
  fillForm();
  fireEvent.click(screen.getByRole("button", { name: "Save player" }));
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Sam Otieno", shirtNumber: 9, height: 180, position: "Forward" })
  );
});

test("shows the edit heading and existing values", () => {
  const player = { id: 5, name: "Jo", shirtNumber: 3, dob: "1999-02-02", height: 175, position: "Defender" };
  render(<PlayerForm player={player} onSave={vi.fn()} onCancel={vi.fn()} />);
  expect(screen.getByRole("heading", { name: "Edit player" })).toBeInTheDocument();
  expect(screen.getByLabelText("Name")).toHaveValue("Jo");
});

test("shows an error when saving fails", async () => {
  const onSave = vi.fn().mockRejectedValue(new Error("Shirt number 9 is already taken."));
  render(<PlayerForm player={{}} onSave={onSave} onCancel={vi.fn()} />);
  fillForm();
  fireEvent.change(screen.getByLabelText("Weight (kg)"), { target: { value: "70" } });
  fireEvent.click(screen.getByRole("button", { name: "Save player" }));
  expect(await screen.findByText("Shirt number 9 is already taken.")).toBeInTheDocument();
});

test("cancel calls onCancel", () => {
  const onCancel = vi.fn();
  render(<PlayerForm player={{}} onSave={vi.fn()} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCancel).toHaveBeenCalled();
});
