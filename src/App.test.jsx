import { render, screen } from "@testing-library/react";
import App from "./App";
import { useAuth } from "./AuthContext";

vi.mock("./AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn(),
}));

const base = {
  signIn: vi.fn(),
  signUp: vi.fn(),
  googleLogin: vi.fn(),
  logout: vi.fn(),
};

test("shows loading first", () => {
  useAuth.mockReturnValue({ ...base, profile: null, loading: true });
  render(<App />);
  expect(screen.getByText("Loading...")).toBeInTheDocument();
});

test("shows the login page when nobody is logged in", () => {
  useAuth.mockReturnValue({ ...base, profile: null, loading: false });
  render(<App />);
  expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
});

test("shows the dashboard when logged in", () => {
  useAuth.mockReturnValue({
    ...base,
    profile: { email: "a@b.com", role: "Admin" },
    loading: false,
  });
  render(<App />);
  expect(screen.getByText("Log out")).toBeInTheDocument();
});
