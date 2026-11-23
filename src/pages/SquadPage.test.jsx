import { render, screen, fireEvent } from "@testing-library/react";
import SquadPage from "./SquadPage";
import * as api from "../api";

vi.mock("../api", () => ({
  getAll: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
}));

const makePlayers = (n) =>
  Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `Player ${i + 1}`, shirtNumber: i + 1, position: "Midfielder" }));

function mockData({ players = makePlayers(20), injuries = [], squads = [] } = {}) {
  api.getAll.mockImplementation(async (resource) => ({ players, injuries, squads }[resource]));
}

const pick = (id, value) =>
  fireEvent.change(screen.getByLabelText(`Selection for Player ${id}`), { target: { value } });

beforeEach(() => vi.resetAllMocks());

test("loads players with empty counters", async () => {
  mockData();
  render(<SquadPage />);
  expect(await screen.findByText("Player 1")).toBeInTheDocument();
  expect(screen.getByText("Starting XI: 0/11")).toBeInTheDocument();
  expect(screen.getByText("Substitutes: 0/7")).toBeInTheDocument();
});

test("counts starters and substitutes", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  pick(1, "starting");
  pick(2, "starting");
  pick(3, "sub");
  expect(screen.getByText("Starting XI: 2/11")).toBeInTheDocument();
  expect(screen.getByText("Substitutes: 1/7")).toBeInTheDocument();
  pick(2, "");
  expect(screen.getByText("Starting XI: 1/11")).toBeInTheDocument();
});

test("a player moves between starting and substitute", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  pick(1, "starting");
  pick(1, "sub");
  expect(screen.getByText("Starting XI: 0/11")).toBeInTheDocument();
  expect(screen.getByText("Substitutes: 1/7")).toBeInTheDocument();
});

test("does not allow a 12th starter", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  for (let i = 1; i <= 11; i++) pick(i, "starting");
  pick(12, "starting");
  expect(screen.getByText(/starting XI is full/)).toBeInTheDocument();
  expect(screen.getByText("Starting XI: 11/11")).toBeInTheDocument();
});

test("does not allow an 8th substitute", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  for (let i = 1; i <= 7; i++) pick(i, "sub");
  pick(8, "sub");
  expect(screen.getByText(/substitutes bench is full/)).toBeInTheDocument();
});

test("needs exactly 11 starters to save", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  pick(1, "starting");
  fireEvent.click(screen.getByRole("button", { name: "Save squad" }));
  expect(screen.getByText("Pick exactly 11 starting players (you have 1).")).toBeInTheDocument();
  expect(api.createItem).not.toHaveBeenCalled();
});

test("saves a new squad", async () => {
  mockData();
  api.createItem.mockImplementation(async (r, data) => ({ ...data, id: 1 }));
  render(<SquadPage />);
  await screen.findByText("Player 1");
  for (let i = 1; i <= 11; i++) pick(i, "starting");
  pick(12, "sub");
  fireEvent.click(screen.getByRole("button", { name: "Save squad" }));
  expect(await screen.findByText("Squad saved.")).toBeInTheDocument();
  expect(api.createItem).toHaveBeenCalledWith("squads", {
    starting: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    subs: [12],
  });
});

test("loads a saved squad, ignores players who have left, and updates it", async () => {
  mockData({ squads: [{ id: 3, starting: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], subs: [12, 999] }] });
  api.updateItem.mockImplementation(async (r, id, data) => ({ ...data, id }));
  render(<SquadPage />);
  await screen.findByText("Player 1");
  expect(screen.getByText("Starting XI: 11/11")).toBeInTheDocument();
  expect(screen.getByText("Substitutes: 1/7")).toBeInTheDocument();
  pick(13, "sub");
  fireEvent.click(screen.getByRole("button", { name: "Save squad" }));
  expect(await screen.findByText("Squad saved.")).toBeInTheDocument();
  expect(api.updateItem).toHaveBeenCalledWith("squads", 3, expect.objectContaining({ subs: [12, 13] }));
});

test("shows an error if saving fails", async () => {
  mockData();
  api.createItem.mockRejectedValue(new Error("Request failed."));
  render(<SquadPage />);
  await screen.findByText("Player 1");
  for (let i = 1; i <= 11; i++) pick(i, "starting");
  fireEvent.click(screen.getByRole("button", { name: "Save squad" }));
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});

test("clear selection empties the lineup", async () => {
  mockData();
  render(<SquadPage />);
  await screen.findByText("Player 1");
  pick(1, "starting");
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(screen.getByText("Starting XI: 0/11")).toBeInTheDocument();
});

test("shows an error if loading fails", async () => {
  api.getAll.mockRejectedValue(new Error("Request failed."));
  render(<SquadPage />);
  expect(await screen.findByText("Request failed.")).toBeInTheDocument();
});
