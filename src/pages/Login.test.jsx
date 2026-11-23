import { render, screen, fireEvent } from "@testing-library/react";
import Login from "./Login";
import { useAuth } from "../AuthContext";

vi.mock("../AuthContext", () => ({ useAuth: vi.fn() }));

function fill(role = "Admin") {
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: role } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "a@b.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "secret1" } });
}

test("lists the four roles", () => {
  useAuth.mockReturnValue({});
  render(<Login />);
  ["Admin", "Medical team", "Head coach", "Assistant coach"].forEach((r) =>
    expect(screen.getByRole("option", { name: r })).toBeInTheDocument()
  );
});

test("signs in with the details entered", () => {
  const signIn = vi.fn().mockResolvedValue();
  useAuth.mockReturnValue({ signIn });
  render(<Login />);
  fill("Medical team");
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(signIn).toHaveBeenCalledWith("a@b.com", "secret1", "Medical team");
});

test("shows a friendly error", async () => {
  const signIn = vi.fn().mockRejectedValue({ code: "auth/invalid-credential" });
  useAuth.mockReturnValue({ signIn });
  render(<Login />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
  expect(await screen.findByText("Wrong email or password.")).toBeInTheDocument();
});

test("can switch to create account", () => {
  const signUp = vi.fn().mockResolvedValue();
  useAuth.mockReturnValue({ signUp });
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: "Create an account" }));
  fill("Head coach");
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(signUp).toHaveBeenCalledWith("a@b.com", "secret1", "Head coach");
});

test("google button needs a role first", () => {
  const googleLogin = vi.fn();
  useAuth.mockReturnValue({ googleLogin });
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(screen.getByText("Please choose your role first.")).toBeInTheDocument();
  expect(googleLogin).not.toHaveBeenCalled();
});

test("google button works once a role is chosen", () => {
  const googleLogin = vi.fn().mockResolvedValue();
  useAuth.mockReturnValue({ googleLogin });
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Head coach" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(googleLogin).toHaveBeenCalledWith("Head coach");
});

test("shows an error if google fails", async () => {
  const googleLogin = vi.fn().mockRejectedValue({ code: "auth/popup-closed-by-user" });
  useAuth.mockReturnValue({ googleLogin });
  render(<Login />);
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: "Admin" } });
  fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));
  expect(await screen.findByText("Google sign-in was cancelled.")).toBeInTheDocument();
});

test("shows a demo button for every role", () => {
  useAuth.mockReturnValue({});
  render(<Login />);
  ["admin@team.com", "medical@team.com", "coach@team.com", "assistant@team.com"].forEach((email) =>
    expect(screen.getByRole("button", { name: new RegExp(email) })).toBeInTheDocument()
  );
});

test("a demo button logs in as that role", () => {
  const demoLogin = vi.fn().mockResolvedValue();
  useAuth.mockReturnValue({ demoLogin });
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: /medical@team.com/ }));
  expect(demoLogin).toHaveBeenCalledWith("Medical team");
});

test("shows an error if the demo login fails", async () => {
  const demoLogin = vi.fn().mockRejectedValue({ code: "auth/email-already-in-use" });
  useAuth.mockReturnValue({ demoLogin });
  render(<Login />);
  fireEvent.click(screen.getByRole("button", { name: /admin@team.com/ }));
  expect(await screen.findByText(/already exists/)).toBeInTheDocument();
});
