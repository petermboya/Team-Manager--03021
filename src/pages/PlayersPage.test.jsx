import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PlayersPage from "./PlayersPage";
import * as api from "../api";

vi.mock("../api", () => ({
  getAll: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward", dob: "2000-01-01", height: 180 };

beforeEach(() => {
  vi.resetAllMocks();
  api.getAll.mockResolvedValue([sam]);
});

function fillForm(name, shirt) {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Shirt number"), { target: { value: String(shirt) } });
  fireEvent.change(screen.getByLabelText("Date of birth"), { target: { value: "2001-02-02" } });
  fireEvent.change(screen.getByLabelText("Height (cm)"), { target: { value: "175" } });
  fireEvent.change(screen.getByLabelText("Position"), { target: { value: "Defender" } });
}

test("loads and shows players", async () => {
  render(<PlayersPage />);
  expect(await screen.findByText("Sam Otieno")).toBeInTheDocument();
});

test("shows an error if loading fails", async () => {
  api.getAll.mockRejectedValue(new Error("Request failed."));
  render(<PlayersPage />);
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("adds a new player", async () => {
  api.createItem.mockImplementation(async (r, data) => ({ ...data, id: 2 }));
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Add player" }));
  fillForm("Jo Kamau", 4);
  fireEvent.click(screen.getByRole("button", { name: "Save player" }));
  expect(await screen.findByText("Jo Kamau")).toBeInTheDocument();
  expect(api.createItem).toHaveBeenCalledWith("players", expect.objectContaining({ name: "Jo Kamau" }));
});

test("rejects a shirt number that is already taken", async () => {
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Add player" }));
  fillForm("Jo Kamau", 9);
  fireEvent.click(screen.getByRole("button", { name: "Save player" }));
  expect(await screen.findByText("Shirt number 9 is already taken.")).toBeInTheDocument();
  expect(api.createItem).not.toHaveBeenCalled();
});

test("edits a player", async () => {
  api.updateItem.mockImplementation(async (r, id, data) => data);
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Samuel Otieno" } });
  fireEvent.click(screen.getByRole("button", { name: "Save player" }));
  expect(await screen.findByText("Samuel Otieno")).toBeInTheDocument();
  expect(api.updateItem).toHaveBeenCalledWith("players", 1, expect.objectContaining({ name: "Samuel Otieno" }));
});

test("deletes a player after confirming", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  api.deleteItem.mockResolvedValue({});
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryByText("Sam Otieno")).not.toBeInTheDocument());
  expect(api.deleteItem).toHaveBeenCalledWith("players", 1, ["injuries", "performances"]);
});

test("does not delete when cancelled", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(false);
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(api.deleteItem).not.toHaveBeenCalled();
  expect(screen.getByText("Sam Otieno")).toBeInTheDocument();
});

test("shows an error if delete fails", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  api.deleteItem.mockRejectedValue(new Error("Request failed."));
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("cancel closes the form", async () => {
  render(<PlayersPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Add player" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
});
