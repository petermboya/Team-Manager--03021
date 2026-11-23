import { useEffect, useState } from "react";
import { getAll, createItem, updateItem } from "../api";
import InjuryForm from "../components/InjuryForm";
import FitnessTable from "../components/FitnessTable";

export default function FitnessPage() {
  const [players, setPlayers] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [editing, setEditing] = useState(null); // the player being updated
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAll("players"), getAll("injuries")])
      .then(([p, i]) => {
        setPlayers(p);
        setInjuries(i);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const findInjury = (player) => injuries.find((i) => i.playerId === player.id);

  async function handleSave(data) {
    const existing = findInjury(editing);
    if (existing) {
      const saved = await updateItem("injuries", existing.id, data);
      setInjuries(injuries.map((i) => (i.id === saved.id ? saved : i)));
    } else {
      const saved = await createItem("injuries", { ...data, playerId: editing.id });
      setInjuries([...injuries, saved]);
    }
    setEditing(null);
  }

  const rows = players.map((player) => ({ player, injury: findInjury(player) }));

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-dark mb-4">Fitness status</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {editing && (
        <InjuryForm
          key={editing.id}
          player={editing}
          injury={findInjury(editing)}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Loading players...</p>
      ) : (
        <FitnessTable rows={rows} onEdit={setEditing} />
      )}
    </div>
  );
}
