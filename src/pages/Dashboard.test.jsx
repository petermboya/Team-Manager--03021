import { render, screen, fireEvent } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { useAuth } from "../AuthContext";

vi.mock("../AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("./PlayersPage", () => ({ default: () => <div>Players page content</div> }));
vi.mock("./FitnessPage", () => ({ default: () => <div>Fitness page content</div> }));
vi.mock("./PerformancePage", () => ({ default: () => <div>Performance page content</div> }));
vi.mock("./OverviewPage", () => ({ default: () => <div>Overview page content</div> }));
vi.mock("./SquadPage", () => ({ default: () => <div>Squad page content</div> }));

function loginAs(role, logout = vi.fn()) {
  useAuth.mockReturnValue({ profile: { email: "a@b.com", role }, logout });
  return logout;
}

const allContent = ["Players", "Fitness", "Performance", "Overview", "Squad"].map((n) => `${n} page content`);

function expectOnly(visible) {
  allContent.forEach((text) => {
    if (text === visible) expect(screen.getByText(text)).toBeInTheDocument();
    else expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
}

test("shows the user and logs out", () => {
  const logout = loginAs("Admin");
  render(<Dashboard />);
  expect(screen.getByText(/a@b.com/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Log out" }));
  expect(logout).toHaveBeenCalled();
});

test("admin sees only the players page", () => {
  loginAs("Admin");
  render(<Dashboard />);
  expectOnly("Players page content");
});

test("medical team sees only the fitness page", () => {
  loginAs("Medical team");
  render(<Dashboard />);
  expectOnly("Fitness page content");
});

test("assistant coach sees only the performance page", () => {
  loginAs("Assistant coach");
  render(<Dashboard />);
  expectOnly("Performance page content");
});

test("head coach sees the overview and can switch to pick the squad", () => {
  loginAs("Head coach");
  render(<Dashboard />);
  expectOnly("Overview page content");
  fireEvent.click(screen.getByRole("button", { name: "Pick squad" }));
  expectOnly("Squad page content");
});

test("head coach has no way to open the other roles' pages", () => {
  loginAs("Head coach");
  render(<Dashboard />);
  ["Players", "Fitness status", "Match performance"].forEach((name) =>
    expect(screen.queryByRole("button", { name })).not.toBeInTheDocument()
  );
});

test("an unknown role sees no page", () => {
  loginAs("Fan");
  render(<Dashboard />);
  allContent.forEach((text) => expect(screen.queryByText(text)).not.toBeInTheDocument());
});
