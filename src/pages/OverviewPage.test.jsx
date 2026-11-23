import { render, screen, fireEvent } from "@testing-library/react";
import OverviewPage from "./OverviewPage";
import * as api from "../api";

vi.mock("../api", () => ({ getAll: vi.fn() }));

const sam = { id: 1, name: "Sam Otieno", shirtNumber: 9, position: "Forward", dob: "2000-01-01", height: 180 };
const match = { id: 1, number: 1, opponent: "Rivals FC", date: "2026-11-08" };
const performance = { id: 10, matchId: 1, playerId: 1, minutesPlayed: 90, goals: 1, assists: 0, passesMade: 5, passesAttempted: 10, rating: 7.4 };

beforeEach(() => {
  vi.resetAllMocks();
  api.getAll.mockImplementation(async (resource) => ({
    players: [sam],
    injuries: [{ id: 5, playerId: 1, status: "Recovering", injuryName: "Calf strain", dateInjured: "2026-11-01", expectedReturn: "2099-01-01" }],
    matches: [match],
    performances: [performance],
  }[resource]));
});

test("lists players with their form", async () => {
  render(<OverviewPage />);
  expect(await screen.findByText("Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Recovering")).toBeInTheDocument();
  expect(screen.getByText("7.4")).toBeInTheDocument();
});

test("opens and closes a player's details", async () => {
  render(<OverviewPage />);
  await screen.findByText("Sam Otieno");
  fireEvent.click(screen.getByRole("button", { name: "View" }));
  expect(screen.getByText("#9 Sam Otieno")).toBeInTheDocument();
  expect(screen.getByText("Calf strain")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.queryByText("#9 Sam Otieno")).not.toBeInTheDocument();
});

test("has no edit buttons", async () => {
  render(<OverviewPage />);
  await screen.findByText("Sam Otieno");
  expect(screen.queryByRole("button", { name: /edit|delete|save|log/i })).not.toBeInTheDocument();
});

test("shows an error if loading fails", async () => {
  api.getAll.mockRejectedValue(new Error("Request failed."));
  render(<OverviewPage />);
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});
