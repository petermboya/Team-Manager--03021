import { calcAge } from "../utils";

export default function PlayerTable({ players, onEdit, onDelete }) {
  if (players.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-gray-500">
        No players yet. Click "Add player" to register the first one.
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
            <th className="px-4 py-3">Date of birth</th>
            <th className="px-4 py-3">Height</th>
            <th className="px-4 py-3">Weight</th>
            <th className="px-4 py-3">Nationality</th>
            <th className="px-4 py-3">Foot</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-t border-gray-100">
              <td className="px-4 py-3 font-semibold">{p.shirtNumber}</td>
              <td className="px-4 py-3">{p.name}</td>
              <td className="px-4 py-3">{p.position}</td>
              <td className="px-4 py-3">
                {p.dob} ({calcAge(p.dob)})
              </td>
              <td className="px-4 py-3">{p.height} cm</td>
              <td className="px-4 py-3">{p.weight ? `${p.weight} kg` : "-"}</td>
              <td className="px-4 py-3">{p.nationality || "-"}</td>
              <td className="px-4 py-3">{p.preferredFoot || "-"}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <button onClick={() => onEdit(p)} className="text-brand hover:underline mr-3">
                  Edit
                </button>
                <button onClick={() => onDelete(p)} className="text-red-600 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
