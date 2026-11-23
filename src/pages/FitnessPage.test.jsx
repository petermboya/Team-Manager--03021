import { render, screen, fireEvent } from "@testing-library/react";
import FitnessPage from "./FitnessPage";
import * as api from "../api";

vi.mock("../api", () => ({
  getAll: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
}));

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9 };

function mockData(injuries = []) {
  api.getAll.mockImplementation(async (resource) => (resource === "players" ? [sam] : injuries));
}

function fillInjury() {
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Injured" } });
  fireEvent.change(screen.getByLabelText("Injury name"), { target: { value: "Hamstring strain" } });
  fireEvent.change(screen.getByLabelText("Date injured"), { target: { value: "2026-11-01" } });
  fireEvent.change(screen.getByLabelText("Expected return date"), { target: { value: "2026-11-20" } });
}

beforeEach(() => vi.resetAllMocks());

test("loads players with their status", async () => {
  mockData();
  render(<FitnessPage />);
  expect(await screen.findByText("Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Match fit")).toBeInTheDocument();
});

test("shows an error if loading fails", async () => {
  api.getAll.mockRejectedValue(new Error("Request failed."));
  render(<FitnessPage />);
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("creates an injury record the first time", async () => {
  mockData();
  api.createItem.mockImplementation(async (r, data) => ({ ...data, id: 10 }));
  render(<FitnessPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  fillInjury();
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(await screen.findByText("Hamstring strain")).toBeInTheDocument();
  expect(api.createItem).toHaveBeenCalledWith("injuries", expect.objectContaining({ playerId: 1, status: "Injured" }));
});

test("updates an existing record", async () => {
  mockData([{ id: 10, playerId: 1, status: "Injured", injuryName: "Ankle", dateInjured: "2026-11-01", expectedReturn: "2026-11-10" }]);
  api.updateItem.mockImplementation(async (r, id, data) => ({ ...data, id, playerId: 1 }));
  render(<FitnessPage />);
  await screen.findByText("Ankle");
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  fireEvent.change(screen.getByLabelText("Status"), { target: { value: "Match fit" } });
  fireEvent.click(screen.getByRole("button", { name: "Save status" }));
  expect(await screen.findByText("Match fit", { selector: "span" })).toBeInTheDocument();
  expect(api.updateItem).toHaveBeenCalledWith("injuries", 10, expect.objectContaining({ status: "Match fit" }));
});

test("cancel closes the form", async () => {
  mockData();
  render(<FitnessPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Status")).not.toBeInTheDocument();
});
