import { useEffect, useState } from "react";
import { getAll } from "../api";
import { calcForm } from "../rating";
import OverviewTable from "../components/OverviewTable";
import PlayerDetail from "../components/PlayerDetail";

export default function OverviewPage() {
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAll("players"), getAll("injuries"), getAll("matches"), getAll("performances")])
      .then(([p, i, m, perf]) => {
        setPlayers(p);
        setInjuries(i);
        setMatches(m);
        setPerformances(perf);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const injuryOf = (player) => injuries.find((i) => i.playerId === player.id);
  const statsOf = (player) => performances.filter((p) => p.playerId === player.id);

  const rows = players.map((player) => ({
    player,
    injury: injuryOf(player),
    form: calcForm(statsOf(player).map((p) => p.rating)),
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-1">Squad overview</h2>
      <p className="text-gray-500 mb-4">Everything about every player. View only.</p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {selected && (
        <PlayerDetail
          key={selected.id}
          player={selected}
          injury={injuryOf(selected)}
          performances={statsOf(selected)}
          matches={matches}
          onClose={() => setSelected(null)}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <OverviewTable rows={rows} onSelect={setSelected} />
      )}
    </div>
  );
}
