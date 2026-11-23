import { useEffect, useState } from "react";
import { getAll, createItem, updateItem, deleteItem } from "../api";
import { calcForm } from "../rating";
import MatchForm from "../components/MatchForm";
import PerformanceForm from "../components/PerformanceForm";
import PerformanceTable from "../components/PerformanceTable";

// The match with the highest number is the latest one
const latest = (list) => list.reduce((a, b) => (!a || b.number > a.number ? b : a), null);

export default function PerformancePage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [matchId, setMatchId] = useState(null);
  const [editing, setEditing] = useState(null); // the player whose stats are being logged
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAll("players"), getAll("matches"), getAll("performances")])
      .then(([p, m, perf]) => {
        setPlayers(p);
        setMatches(m);
        setPerformances(perf);
        setMatchId(latest(m)?.id ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const match = matches.find((m) => m.id === matchId);
  const findPerformance = (player) =>
    performances.find((p) => p.matchId === matchId && p.playerId === player.id);

  async function handleCreateMatch(data) {
    const number = Math.max(0, ...matches.map((m) => m.number)) + 1;
    const saved = await createItem("matches", { ...data, number });
    setMatches([...matches, saved]);
    setMatchId(saved.id);
    setShowMatchForm(false);
  }

  async function handleDeleteMatch() {
    if (!window.confirm(`Delete match ${match.number} and all its stats? This cannot be undone.`)) return;
    try {
      await deleteItem("matches", match.id, ["performances"]);
      const remaining = matches.filter((m) => m.id !== match.id);
      setMatches(remaining);
      setPerformances(performances.filter((p) => p.matchId !== match.id));
      setMatchId(latest(remaining)?.id ?? null);
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSavePerformance(data) {
    const existing = findPerformance(editing);
    if (existing) {
      const saved = await updateItem("performances", existing.id, data);
      setPerformances(performances.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      const saved = await createItem("performances", { ...data, matchId, playerId: editing.id });
      setPerformances([...performances, saved]);
    }
    setEditing(null);
  }

  async function handleDeletePerformance(performance) {
    if (!window.confirm("Delete these stats? This cannot be undone.")) return;
    try {
      await deleteItem("performances", performance.id);
      setPerformances(performances.filter((p) => p.id !== performance.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const rows = players.map((player) => {
    const own = performances.filter((p) => p.playerId === player.id);
    return {
      player,
      performance: findPerformance(player),
      form: calcForm(own.map((p) => p.rating)),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl font-bold text-brand-dark">Match performance</h2>
        <div className="flex flex-wrap items-center gap-3">
          {matches.length > 0 && (
            <select
              aria-label="Match"
              value={matchId ?? ""}
              onChange={(e) => {
                setMatchId(Number(e.target.value));
                setEditing(null);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  Match {m.number} vs {m.opponent} ({m.date})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => setShowMatchForm(true)}
            className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark"
          >
            New match
          </button>
          {match && (
            <button
              onClick={handleDeleteMatch}
              className="border border-red-300 text-red-600 rounded-lg px-4 py-2 hover:bg-red-50"
            >
              Delete match
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {showMatchForm && (
        <MatchForm onSave={handleCreateMatch} onCancel={() => setShowMatchForm(false)} />
      )}

      {editing && match && (
        <PerformanceForm
          key={`${match.id}-${editing.id}`}
          player={editing}
          match={match}
          performance={findPerformance(editing)}
          onSave={handleSavePerformance}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : match ? (
        <PerformanceTable rows={rows} onLog={setEditing} onDelete={handleDeletePerformance} />
      ) : (
        <div className="bg-white rounded-xl shadow p-6 text-gray-500">
          Create your first match to start logging player stats.
        </div>
      )}
    </div>
  );
}
