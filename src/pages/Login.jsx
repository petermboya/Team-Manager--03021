import { useState } from "react";
import { useAuth } from "../AuthContext";
import { ROLES } from "../roles";
import { DEMO_ACCOUNTS } from "../demoAccounts";

function friendlyError(err) {
  const messages = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  };
  return messages[err.code] || err.message || "Something went wrong. Please try again.";
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand";

export default function Login() {
  const { signIn, signUp, googleLogin, demoLogin } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const isSignUp = mode === "signup";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) await signUp(email, password, role);
      else await signIn(email, password, role);
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function handleGoogle() {
    setError("");
    if (!role) {
      setError("Please choose your role first.");
      return;
    }
    try {
      await googleLogin(role);
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function handleDemo(demoRole) {
    setError("");
    try {
      await demoLogin(demoRole);
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold text-brand text-center">Team Manager</h1>
        <p className="text-center text-gray-500 mt-1 mb-6">
          {isSignUp ? "Create your account" : "Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Choose your role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-brand text-white rounded-lg py-2 font-medium hover:bg-brand-dark"
          >
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-4 text-center text-sm text-gray-400">or</div>

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full border border-gray-300 rounded-lg py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isSignUp ? "signin" : "signup");
            setError("");
          }}
          className="w-full mt-4 text-sm text-brand hover:underline"
        >
          {isSignUp ? "I already have an account" : "Create an account"}
        </button>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-700">Demo accounts</p>
          <p className="text-xs text-gray-500 mb-3">
            One click to try each role. The password is the first word of the role + 123 (for
            example admin123).
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((d) => (
              <button
                key={d.role}
                type="button"
                onClick={() => handleDemo(d.role)}
                className="border border-brand text-brand rounded-lg px-3 py-2 text-sm hover:bg-brand-light"
              >
                <span className="block font-medium">{d.role}</span>
                <span className="block text-xs text-gray-500">{d.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
