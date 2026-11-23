import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

test("shows the status", () => {
  render(<StatusBadge status="Injured" />);
  expect(screen.getByText("Injured")).toBeInTheDocument();
});

test("defaults to match fit", () => {
  render(<StatusBadge />);
  expect(screen.getByText("Match fit")).toBeInTheDocument();
});
