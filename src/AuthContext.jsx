import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { getProfile, saveProfile } from "./api";
import { DEMO_ACCOUNTS } from "./demoAccounts";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null); // { id, email, role }
  const [loading, setLoading] = useState(true);
  const busy = useRef(false); // true while a login is being checked

  // Keeps you logged in after a page refresh
  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (busy.current) return;
      try {
        setProfile(firebaseUser ? await getProfile(firebaseUser.uid) : null);
      } catch {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  // Checks the saved role for this account against the role chosen at login
  async function finish(firebaseUser, role, allowCreate) {
    let found = await getProfile(firebaseUser.uid);
    if (!found && allowCreate) {
      found = await saveProfile({ id: firebaseUser.uid, email: firebaseUser.email, role });
    }
    if (!found) {
      await signOut(auth);
      throw new Error("No role is saved for this account. Please create an account first.");
    }
    if (found.role !== role) {
      await signOut(auth);
      throw new Error(`This account is registered as ${found.role}, not ${role}.`);
    }
    setProfile(found);
  }

  async function run(action) {
    busy.current = true;
    try {
      await action();
    } finally {
      busy.current = false;
    }
  }

  const signUp = (email, password, role) =>
    run(async () => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await finish(cred.user, role, true);
    });

  const signIn = (email, password, role) =>
    run(async () => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await finish(cred.user, role, false);
    });

  const googleLogin = (role) =>
    run(async () => {
      const cred = await signInWithPopup(auth, googleProvider);
      await finish(cred.user, role, true);
    });

  // One-click demo login. The demo account is created the first time it is used.
  const demoLogin = (role) =>
    run(async () => {
      const demo = DEMO_ACCOUNTS.find((d) => d.role === role);
      let cred;
      try {
        cred = await signInWithEmailAndPassword(auth, demo.email, demo.password);
      } catch (err) {
        if (err.code !== "auth/invalid-credential" && err.code !== "auth/user-not-found") throw err;
        cred = await createUserWithEmailAndPassword(auth, demo.email, demo.password);
      }
      await finish(cred.user, role, true);
    });

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ profile, loading, signUp, signIn, googleLogin, demoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
