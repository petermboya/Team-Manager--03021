import StatusBadge from "./StatusBadge";
import { describeTimeline, todayISO } from "../utils";

// rows = [{ player, injury }]. Pass onEdit to show an "Update" button (Medical team only).
export default function FitnessTable({ rows, onEdit, today = todayISO() }) {
  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        No players yet. The Admin needs to add players first.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-light text-brand-dark">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Injury</th>
            <th className="px-4 py-3">Date injured</th>
            <th className="px-4 py-3">Expected return</th>
            <th className="px-4 py-3">Days out</th>
            <th className="px-4 py-3">Recovery</th>
            {onEdit && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, injury }) => {
            const timeline = describeTimeline(injury, today);
            return (
              <tr key={player.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold">{player.shirtNumber}</td>
                <td className="px-4 py-3">{player.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={injury?.status} />
                </td>
                <td className="px-4 py-3">{injury?.injuryName || "-"}</td>
                <td className="px-4 py-3">{timeline ? injury.dateInjured : "-"}</td>
                <td className="px-4 py-3">{timeline ? injury.expectedReturn : "-"}</td>
                <td className="px-4 py-3">{timeline ? timeline.out : "-"}</td>
                <td className="px-4 py-3">{timeline ? timeline.left : "-"}</td>
                {onEdit && (
                  <td className="px-4 py-3">
                    <button onClick={() => onEdit(player)} className="text-brand hover:underline">
                      Update
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
