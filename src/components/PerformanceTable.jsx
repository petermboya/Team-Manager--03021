import { formatRatio } from "../rating";

// rows = [{ player, performance, form }]
// Pass onLog / onDelete to show the Actions column (Assistant coach only).
export default function PerformanceTable({ rows, onLog, onDelete }) {
  const showActions = Boolean(onLog);

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
            <th className="px-4 py-3">Minutes</th>
            <th className="px-4 py-3">Goals</th>
            <th className="px-4 py-3">Assists</th>
            <th className="px-4 py-3">Pass accuracy</th>
            <th className="px-4 py-3">Match rating</th>
            <th className="px-4 py-3">Form</th>
            {showActions && <th className="px-4 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, performance, form }) => (
            <tr key={player.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-semibold">{player.shirtNumber}</td>
              <td className="px-4 py-3">{player.name}</td>
              <td className="px-4 py-3">{performance ? performance.minutesPlayed : "-"}</td>
              <td className="px-4 py-3">{performance ? performance.goals : "-"}</td>
              <td className="px-4 py-3">{performance ? performance.assists : "-"}</td>
              <td className="px-4 py-3">
                {performance ? formatRatio(performance.passesMade, performance.passesAttempted) : "-"}
              </td>
              <td className="px-4 py-3 font-bold text-brand">
                {performance ? performance.rating.toFixed(1) : <span className="font-normal text-gray-400">Not logged</span>}
              </td>
              <td className="px-4 py-3 font-semibold">{form === null ? "-" : form.toFixed(1)}</td>
              {showActions && (
                <td className="px-4 py-3 whitespace-nowrap">
                  <button onClick={() => onLog(player)} className="text-brand hover:underline mr-3">
                    {performance ? "Edit" : "Log stats"}
                  </button>
                  {performance && (
                    <button onClick={() => onDelete(performance)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
