import { useEffect, useState } from "react";
import { getAll, createItem, updateItem, deleteItem } from "../api";
import PlayerForm from "../components/PlayerForm";
import PlayerTable from "../components/PlayerTable";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [editing, setEditing] = useState(null); // null = form closed, {} = new player
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAll("players")
      .then(setPlayers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(data) {
    const taken = players.some(
      (p) => p.id !== data.id && Number(p.shirtNumber) === Number(data.shirtNumber)
    );
    if (taken) throw new Error(`Shirt number ${data.shirtNumber} is already taken.`);

    if (data.id) {
      const saved = await updateItem("players", data.id, data);
      setPlayers(players.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      const saved = await createItem("players", data);
      setPlayers([...players, saved]);
    }
    setEditing(null);
  }

  async function handleDelete(player) {
    if (!window.confirm(`Delete ${player.name}? This cannot be undone.`)) return;
    try {
      await deleteItem("players", player.id, ["injuries", "performances"]);
      setPlayers(players.filter((p) => p.id !== player.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-brand-dark">Players</h2>
        <button
          onClick={() => setEditing({})}
          className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark"
        >
          Add player
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {editing && (
        <PlayerForm
          key={editing.id ?? "new"}
          player={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading ? (
        <p className="text-gray-500">Loading players...</p>
      ) : (
        <PlayerTable players={players} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </div>
  );
}
