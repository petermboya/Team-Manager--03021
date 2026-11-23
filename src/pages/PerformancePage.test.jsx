import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PerformancePage from "./PerformancePage";
import * as api from "../api";

vi.mock("../api", () => ({
  getAll: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}));

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9 };
const match1 = { id: 1, number: 1, opponent: "Rivals FC", date: "2026-11-08" };
const match2 = { id: 2, number: 2, opponent: "City FC", date: "2026-11-15" };

function mockData({ matches = [match1], performances = [] } = {}) {
  api.getAll.mockImplementation(async (resource) => {
    if (resource === "players") return [sam];
    if (resource === "matches") return matches;
    return performances;
  });
}

function type(label, value) {
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } });
}

beforeEach(() => vi.resetAllMocks());

test("loads players and selects the latest match", async () => {
  mockData({ matches: [match1, match2] });
  render(<PerformancePage />);
  expect(await screen.findByText("Sam Otieno")).toBeInTheDocument();
  expect(screen.getByLabelText("Match")).toHaveValue("2");
  fireEvent.change(screen.getByLabelText("Match"), { target: { value: "1" } });
  expect(screen.getByLabelText("Match")).toHaveValue("1");
});

test("asks you to create a match first when there are none", async () => {
  mockData({ matches: [] });
  render(<PerformancePage />);
  expect(await screen.findByText(/Create your first match/)).toBeInTheDocument();
});

test("shows an error if loading fails", async () => {
  api.getAll.mockRejectedValue(new Error("Request failed."));
  render(<PerformancePage />);
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("creates a match with the next number", async () => {
  mockData({ matches: [] });
  api.createItem.mockImplementation(async (r, data) => ({ ...data, id: 5 }));
  render(<PerformancePage />);
  await screen.findByText(/Create your first match/);
  fireEvent.click(screen.getByRole("button", { name: "New match" }));
  fireEvent.change(screen.getByLabelText("Opponent"), { target: { value: "Rivals FC" } });
  fireEvent.click(screen.getByRole("button", { name: "Create match" }));
  expect(await screen.findByText("Sam Otieno")).toBeInTheDocument();
  expect(api.createItem).toHaveBeenCalledWith("matches", expect.objectContaining({ number: 1, opponent: "Rivals FC" }));
});

test("logs stats for a player", async () => {
  mockData();
  api.createItem.mockImplementation(async (r, data) => ({ ...data, id: 9 }));
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Log stats" }));
  type("Minutes played", 90);
  type("Goals", 1);
  fireEvent.click(screen.getByRole("button", { name: "Save stats" }));
  expect((await screen.findAllByText("7.0")).length).toBeGreaterThan(0);
  expect(api.createItem).toHaveBeenCalledWith(
    "performances",
    expect.objectContaining({ matchId: 1, playerId: 1, goals: 1, rating: 7 })
  );
});

test("edits stats that were already logged", async () => {
  mockData({ performances: [{ id: 7, matchId: 1, playerId: 1, minutesPlayed: 90, goals: 1, rating: 7 }] });
  api.updateItem.mockImplementation(async (r, id, data) => ({ ...data, id, matchId: 1, playerId: 1 }));
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  type("Goals", 2);
  fireEvent.click(screen.getByRole("button", { name: "Save stats" }));
  expect((await screen.findAllByText("8.0")).length).toBeGreaterThan(0);
  expect(api.updateItem).toHaveBeenCalledWith("performances", 7, expect.objectContaining({ goals: 2 }));
});

test("deletes logged stats after confirming", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  mockData({ performances: [{ id: 7, matchId: 1, playerId: 1, minutesPlayed: 90, goals: 1, rating: 7 }] });
  api.deleteItem.mockResolvedValue({});
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(await screen.findByText("Not logged")).toBeInTheDocument();
  expect(api.deleteItem).toHaveBeenCalledWith("performances", 7);
});

test("does not delete stats when cancelled", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(false);
  mockData({ performances: [{ id: 7, matchId: 1, playerId: 1, minutesPlayed: 90, goals: 1, rating: 7 }] });
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  expect(api.deleteItem).not.toHaveBeenCalled();
});

test("deletes a match together with its stats", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  mockData();
  api.deleteItem.mockResolvedValue({});
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete match" }));
  await waitFor(() => expect(screen.getByText(/Create your first match/)).toBeInTheDocument());
  expect(api.deleteItem).toHaveBeenCalledWith("matches", 1, ["performances"]);
});

test("shows an error if deleting a match fails", async () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  mockData();
  api.deleteItem.mockRejectedValue(new Error("Request failed."));
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Delete match" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("cancel closes the stats form and the match form", async () => {
  mockData();
  render(<PerformancePage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "Log stats" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Goals")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "New match" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByLabelText("Opponent")).not.toBeInTheDocument();
});
