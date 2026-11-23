import { useState } from "react";
import { useAuth } from "../AuthContext";
import { pagesFor } from "../permissions";
import { USE_LOCAL } from "../api";
import PlayersPage from "./PlayersPage";
import FitnessPage from "./FitnessPage";
import PerformancePage from "./PerformancePage";
import OverviewPage from "./OverviewPage";
import SquadPage from "./SquadPage";

// Page id -> component. Pages without one show "coming soon".
const PAGE_COMPONENTS = {
  players: PlayersPage,
  fitness: FitnessPage,
  performance: PerformancePage,
  overview: OverviewPage,
  selection: SquadPage,
};

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const pages = pagesFor(profile.role);
  const [current, setCurrent] = useState(pages[0]?.id);

  // Only pages this role is allowed to see can ever be shown
  const allowed = pages.some((p) => p.id === current);
  const Page = PAGE_COMPONENTS[current];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-brand text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Team Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {profile.email} · <strong>{profile.role}</strong>
          </span>
          <button
            onClick={logout}
            className="bg-white text-brand rounded-lg px-3 py-1 text-sm font-medium hover:bg-brand-light"
          >
            Log out
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-6 flex gap-6">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrent(p.id)}
            className={`py-3 text-sm font-medium border-b-2 ${
              current === p.id
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {USE_LOCAL && (
        <p className="bg-brand-light text-brand-dark text-sm px-6 py-2">
          Demo mode: the data is saved in this browser only.
        </p>
      )}

      <main className="p-6">
        {allowed &&
          (Page ? (
            <Page />
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-gray-500">
              This page is coming in a later step.
            </div>
          ))}
      </main>
    </div>
  );
}
