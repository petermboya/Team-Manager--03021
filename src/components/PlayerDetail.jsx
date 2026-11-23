import { useState } from "react";
import StatusBadge from "./StatusBadge";
import StatsView from "./StatsView";
import { calcAge, describeTimeline } from "../utils";
import { calcForm, formatRatio } from "../rating";

function Item({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

// Everything about one player, read-only (Head coach)
export default function PlayerDetail({ player, injury, performances, matches, onClose }) {
  const history = performances
    .map((perf) => ({ perf, match: matches.find((m) => m.id === perf.matchId) }))
    .filter((h) => h.match)
    .sort((a, b) => a.match.number - b.match.number);

  const [selectedId, setSelectedId] = useState(
    history.length ? history[history.length - 1].perf.id : null
  );
  const selected = history.find((h) => h.perf.id === selectedId);
  const timeline = describeTimeline(injury);
  const form = calcForm(history.map((h) => h.perf.rating));

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-brand-dark">
          #{player.shirtNumber} {player.name}
        </h3>
        <button onClick={onClose} className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 hover:bg-gray-50">
          Close
        </button>
      </div>

      <h4 className="font-semibold text-brand-dark mb-2">Bio</h4>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Item label="Position">{player.position}</Item>
        <Item label="Date of birth">
          {player.dob} ({calcAge(player.dob)})
        </Item>
        <Item label="Height">{player.height} cm</Item>
        <Item label="Weight">{player.weight ? `${player.weight} kg` : "-"}</Item>
        <Item label="Nationality">{player.nationality || "-"}</Item>
        <Item label="Preferred foot">{player.preferredFoot || "-"}</Item>
      </dl>

      <h4 className="font-semibold text-brand-dark mb-2">Fitness</h4>
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <StatusBadge status={injury?.status} />
        {timeline && (
          <dl className="grid gap-3 sm:grid-cols-4 flex-1">
            <Item label="Injury">{injury.injuryName}</Item>
            <Item label="Date injured">{injury.dateInjured}</Item>
            <Item label="Expected return">{injury.expectedReturn}</Item>
            <Item label="Days out / recovery">
              {timeline.out} / {timeline.left}
            </Item>
          </dl>
        )}
      </div>

      <h4 className="font-semibold text-brand-dark mb-2">
        Performance {form !== null && <span className="text-gray-500 font-normal">(form {form.toFixed(1)})</span>}
      </h4>
      {history.length === 0 ? (
        <p className="text-gray-500">No match stats logged yet.</p>
      ) : (
        <>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-light text-brand-dark">
                <tr>
                  <th className="px-3 py-2">Match</th>
                  <th className="px-3 py-2">Opponent</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Minutes</th>
                  <th className="px-3 py-2">Goals</th>
                  <th className="px-3 py-2">Assists</th>
                  <th className="px-3 py-2">Pass accuracy</th>
                  <th className="px-3 py-2">Rating</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {history.map(({ perf, match }) => (
                  <tr
                    key={perf.id}
                    className={`border-t border-gray-100 ${perf.id === selectedId ? "bg-brand-light/40" : ""}`}
                  >
                    <td className="px-3 py-2">Match {match.number}</td>
                    <td className="px-3 py-2">{match.opponent}</td>
                    <td className="px-3 py-2">{match.date}</td>
                    <td className="px-3 py-2">{perf.minutesPlayed}</td>
                    <td className="px-3 py-2">{perf.goals}</td>
                    <td className="px-3 py-2">{perf.assists}</td>
                    <td className="px-3 py-2">{formatRatio(perf.passesMade, perf.passesAttempted)}</td>
                    <td className="px-3 py-2 font-bold text-brand">{perf.rating.toFixed(1)}</td>
                    <td className="px-3 py-2">
                      <button onClick={() => setSelectedId(perf.id)} className="text-brand hover:underline">
                        View stats
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="border-t border-gray-100 pt-4">
              <h5 className="font-semibold text-gray-700 mb-3">
                Full stats: Match {selected.match.number} vs {selected.match.opponent}
              </h5>
              <StatsView performance={selected.perf} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
