import StatusBadge from "./StatusBadge";

// assign = { [playerId]: "starting" | "sub" }
export default function SquadSelector({ players, injuries, assign, onChange }) {
  if (players.length === 0) {
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
            <th className="px-4 py-3">Fitness</th>
            <th className="px-4 py-3">Selection</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const injury = injuries.find((i) => i.playerId === player.id);
            const fit = !injury || injury.status === "Match fit";
            const chosen = assign[player.id];
            return (
              <tr key={player.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-semibold">{player.shirtNumber}</td>
                <td className="px-4 py-3">{player.name}</td>
                <td className="px-4 py-3">{player.position}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={injury?.status} />
                  {!fit && injury.injuryName && (
                    <span className="ml-2 text-gray-500">{injury.injuryName}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    aria-label={`Selection for ${player.name}`}
                    value={chosen || ""}
                    onChange={(e) => onChange(player, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1"
                  >
                    <option value="">Not selected</option>
                    <option value="starting">Starting XI</option>
                    <option value="sub">Substitute</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-red-600">
                  {chosen && !fit && `Not match fit (${injury.status.toLowerCase()}). Check with the medical team.`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
