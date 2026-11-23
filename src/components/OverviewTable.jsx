import StatusBadge from "./StatusBadge";
import { calcAge } from "../utils";

// rows = [{ player, injury, form }]
export default function OverviewTable({ rows, onSelect }) {
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
            <th className="px-4 py-3">Position</th>
            <th className="px-4 py-3">Age</th>
            <th className="px-4 py-3">Fitness</th>
            <th className="px-4 py-3">Form</th>
            <th className="px-4 py-3">Details</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ player, injury, form }) => (
            <tr key={player.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-semibold">{player.shirtNumber}</td>
              <td className="px-4 py-3">{player.name}</td>
              <td className="px-4 py-3">{player.position}</td>
              <td className="px-4 py-3">{calcAge(player.dob)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={injury?.status} />
              </td>
              <td className="px-4 py-3 font-semibold">{form === null ? "-" : form.toFixed(1)}</td>
              <td className="px-4 py-3">
                <button onClick={() => onSelect(player)} className="text-brand hover:underline">
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
