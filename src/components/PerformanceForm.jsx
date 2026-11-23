import { useState } from "react";
import { GROUPS, ALL_KEYS, toNumbers } from "../statFields";
import { calcRating, formatRatio, shotAccuracy } from "../rating";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand";

function NumberField({ id, label, value, onChange, max, required }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        max={max}
        placeholder="0"
        value={value}
        onChange={onChange}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

export default function PerformanceForm({ player, match, performance, onSave, onCancel }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      ALL_KEYS.map((k) => [k, performance && performance[k] !== undefined ? String(performance[k]) : ""])
    )
  );
  const [error, setError] = useState("");

  const change = (key) => (e) => setValues({ ...values, [key]: e.target.value });
  const nums = toNumbers(values);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    for (const group of GROUPS) {
      for (const [made, total, madeLabel, totalLabel] of group.pairs || []) {
        if (nums[made] > nums[total]) {
          setError(`${madeLabel} can't be more than ${totalLabel.toLowerCase()}.`);
          return;
        }
      }
    }

    try {
      await onSave({ ...nums, rating: calcRating(nums) });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-brand-dark">Log stats: {player.name}</h3>
      <p className="text-sm text-gray-500 mb-4">
        Match {match.number} vs {match.opponent}
      </p>

      {GROUPS.map((group) => (
        <fieldset key={group.title} className="mb-6">
          <legend className="font-semibold text-gray-700 mb-3">{group.title}</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(group.fields || []).map(([key, label]) => (
              <NumberField
                key={key}
                id={key}
                label={label}
                value={values[key]}
                onChange={change(key)}
                max={key === "minutesPlayed" ? 120 : undefined}
                required={key === "minutesPlayed"}
              />
            ))}
            {(group.pairs || []).map(([made, total, madeLabel, totalLabel]) => (
              <div key={made} className="sm:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <NumberField id={made} label={madeLabel} value={values[made]} onChange={change(made)} />
                  <NumberField id={total} label={totalLabel} value={values[total]} onChange={change(total)} />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Result: {formatRatio(nums[made], nums[total])}
                </p>
              </div>
            ))}
          </div>
          {group.title === "Shooting" && (
            <p className="text-sm text-gray-500 mt-2">Shot accuracy: {shotAccuracy(nums)}</p>
          )}
        </fieldset>
      ))}

      <p className="text-gray-700 mb-4">
        Match rating (calculated):{" "}
        <strong className="text-brand text-xl">{calcRating(nums).toFixed(1)}</strong>
      </p>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark">
          Save stats
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
