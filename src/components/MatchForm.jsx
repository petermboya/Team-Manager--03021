import { useState } from "react";
import { todayISO } from "../utils";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand";

export default function MatchForm({ onSave, onCancel }) {
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await onSave({ opponent: opponent.trim(), date });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-brand-dark mb-4">New match</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="opponent" className="block text-sm font-medium text-gray-700 mb-1">
            Opponent
          </label>
          <input id="opponent" value={opponent} onChange={(e) => setOpponent(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="matchDate" className="block text-sm font-medium text-gray-700 mb-1">
            Match date
          </label>
          <input id="matchDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark">
          Create match
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
