import { useEffect, useState } from "react";
import { getAll, createItem, updateItem } from "../api";
import SquadSelector from "../components/SquadSelector";

const LIMITS = { starting: 11, sub: 7 };

// Turns the saved squad into { [playerId]: "starting" | "sub" } (ignores players who have since left)
function toAssign(saved, players) {
  const assign = {};
  if (!saved) return assign;
  const exists = (id) => players.some((p) => p.id === id);
  (saved.starting || []).filter(exists).forEach((id) => (assign[id] = "starting"));
  (saved.subs || []).filter(exists).forEach((id) => (assign[id] = "sub"));
  return assign;
}

export default function SquadPage() {
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [squad, setSquad] = useState(null); // the saved squad record
  const [assign, setAssign] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAll("players"), getAll("injuries"), getAll("squads")])
      .then(([p, i, s]) => {
        setPlayers(p);
        setInjuries(i);
        setSquad(s[0] || null);
        setAssign(toAssign(s[0], p));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const count = (kind) => Object.values(assign).filter((v) => v === kind).length;

  function handleChange(player, value) {
    setMessage("");
    if (value && assign[player.id] !== value && count(value) >= LIMITS[value]) {
      setError(
        value === "starting"
          ? "The starting XI is full (11 players). Move someone out first."
          : "The substitutes bench is full (7 players). Move someone out first."
      );
      return;
    }
    setError("");
    const next = { ...assign };
    if (value) next[player.id] = value;
    else delete next[player.id];
    setAssign(next);
  }

  async function handleSave() {
    setMessage("");
    if (count("starting") !== LIMITS.starting) {
      setError(`Pick exactly 11 starting players (you have ${count("starting")}).`);
      return;
    }
    setError("");
    const data = {
      starting: players.filter((p) => assign[p.id] === "starting").map((p) => p.id),
      subs: players.filter((p) => assign[p.id] === "sub").map((p) => p.id),
    };
    try {
      const saved = squad
        ? await updateItem("squads", squad.id, data)
        : await createItem("squads", data);
      setSquad(saved);
      setMessage("Squad saved.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-1">Pick squad</h2>
      <p className="text-gray-500 mb-4">
        Choose your starting 11 and up to 7 substitutes. Injured and recovering players can be
        picked too, but they are flagged.
      </p>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <span className="font-semibold text-brand-dark">{`Starting XI: ${count("starting")}/${LIMITS.starting}`}</span>
        <span className="font-semibold text-brand-dark">{`Substitutes: ${count("sub")}/${LIMITS.sub}`}</span>
        <button onClick={handleSave} className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark">
          Save squad
        </button>
        <button
          onClick={() => {
            setAssign({});
            setMessage("");
            setError("");
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Clear selection
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-700 mb-4">{message}</p>}

      {loading ? (
        <p className="text-gray-500">Loading players...</p>
      ) : (
        <SquadSelector players={players} injuries={injuries} assign={assign} onChange={handleChange} />
      )}
    </div>
  );
}
