import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import * as fb from "firebase/auth";
import * as api from "./api";

vi.mock("./firebase", () => ({ auth: {}, googleProvider: {} }));
vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("./api", () => ({ getProfile: vi.fn(), saveProfile: vi.fn() }));

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
const fbUser = { uid: "u1", email: "a@b.com" };

async function setup() {
  const hook = renderHook(() => useAuth(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

beforeEach(() => {
  vi.resetAllMocks();
  fb.onAuthStateChanged.mockImplementation((auth, cb) => {
    cb(null);
    return () => {};
  });
});

test("sign in works when the role matches", async () => {
  fb.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue({ id: "u1", email: "a@b.com", role: "Admin" });
  const { result } = await setup();
  await act(() => result.current.signIn("a@b.com", "pw", "Admin"));
  expect(result.current.profile.role).toBe("Admin");
});

test("sign in is rejected when the role does not match", async () => {
  fb.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue({ id: "u1", email: "a@b.com", role: "Medical team" });
  const { result } = await setup();
  await act(async () => {
    await expect(result.current.signIn("a@b.com", "pw", "Admin")).rejects.toThrow(
      "registered as Medical team"
    );
  });
  expect(fb.signOut).toHaveBeenCalled();
  expect(result.current.profile).toBeNull();
});

test("sign in is rejected when the account has no saved role", async () => {
  fb.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue(null);
  const { result } = await setup();
  await act(async () => {
    await expect(result.current.signIn("a@b.com", "pw", "Admin")).rejects.toThrow(
      "No role is saved"
    );
  });
});

test("sign up saves the chosen role", async () => {
  fb.createUserWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue(null);
  api.saveProfile.mockImplementation(async (p) => p);
  const { result } = await setup();
  await act(() => result.current.signUp("a@b.com", "pw", "Head coach"));
  expect(api.saveProfile).toHaveBeenCalledWith({ id: "u1", email: "a@b.com", role: "Head coach" });
  expect(result.current.profile.role).toBe("Head coach");
});

test("google login creates a profile the first time", async () => {
  fb.signInWithPopup.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue(null);
  api.saveProfile.mockImplementation(async (p) => p);
  const { result } = await setup();
  await act(() => result.current.googleLogin("Assistant coach"));
  expect(result.current.profile.role).toBe("Assistant coach");
});

test("logout clears the profile", async () => {
  fb.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue({ id: "u1", email: "a@b.com", role: "Admin" });
  const { result } = await setup();
  await act(() => result.current.signIn("a@b.com", "pw", "Admin"));
  await act(() => result.current.logout());
  expect(result.current.profile).toBeNull();
});

test("keeps you logged in after a refresh", async () => {
  fb.onAuthStateChanged.mockImplementation((auth, cb) => {
    cb(fbUser);
    return () => {};
  });
  api.getProfile.mockResolvedValue({ id: "u1", email: "a@b.com", role: "Admin" });
  const { result } = await setup();
  expect(result.current.profile.role).toBe("Admin");
});

test("falls back to logged out if the server is down", async () => {
  fb.onAuthStateChanged.mockImplementation((auth, cb) => {
    cb(fbUser);
    return () => {};
  });
  api.getProfile.mockRejectedValue(new Error("down"));
  const { result } = await setup();
  expect(result.current.profile).toBeNull();
});

test("demo login signs in when the demo account exists", async () => {
  fb.signInWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue({ id: "u1", email: "admin@team.com", role: "Admin" });
  const { result } = await setup();
  await act(() => result.current.demoLogin("Admin"));
  expect(fb.signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "admin@team.com", "admin123");
  expect(result.current.profile.role).toBe("Admin");
});

test("demo login creates the demo account the first time", async () => {
  fb.signInWithEmailAndPassword.mockRejectedValue({ code: "auth/invalid-credential" });
  fb.createUserWithEmailAndPassword.mockResolvedValue({ user: fbUser });
  api.getProfile.mockResolvedValue(null);
  api.saveProfile.mockImplementation(async (p) => p);
  const { result } = await setup();
  await act(() => result.current.demoLogin("Medical team"));
  expect(fb.createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "medical@team.com", "medical123");
  expect(result.current.profile.role).toBe("Medical team");
});

test("demo login passes on other errors without creating an account", async () => {
  fb.signInWithEmailAndPassword.mockRejectedValue({ code: "auth/network-request-failed" });
  const { result } = await setup();
  await act(async () => {
    await expect(result.current.demoLogin("Admin")).rejects.toEqual({ code: "auth/network-request-failed" });
  });
  expect(fb.createUserWithEmailAndPassword).not.toHaveBeenCalled();
});
