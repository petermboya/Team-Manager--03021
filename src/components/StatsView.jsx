import { GROUPS } from "../statFields";
import { formatRatio, shotAccuracy } from "../rating";

function Item({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

// Read-only view of every stat logged for one match
export default function StatsView({ performance }) {
  return (
    <div>
      <p className="mb-4 text-gray-700">
        Match rating: <strong className="text-brand text-xl">{performance.rating.toFixed(1)}</strong>
      </p>
      {GROUPS.map((group) => (
        <div key={group.title} className="mb-4">
          <h4 className="font-semibold text-brand-dark mb-2">{group.title}</h4>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(group.fields || []).map(([key, label]) => (
              <Item key={key} label={label} value={performance[key] ?? 0} />
            ))}
            {(group.pairs || []).map(([made, total, label]) => (
              <Item
                key={made}
                label={label}
                value={formatRatio(performance[made] ?? 0, performance[total] ?? 0)}
              />
            ))}
            {group.title === "Shooting" && (
              <Item label="Shot accuracy" value={shotAccuracy(performance)} />
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
