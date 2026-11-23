import { useState } from "react";
import { STATUSES } from "../statuses";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand";

function Field({ label, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function InjuryForm({ player, injury, onSave, onCancel }) {
  const [values, setValues] = useState({
    status: "Match fit",
    injuryName: "",
    dateInjured: "",
    expectedReturn: "",
    ...injury,
  });
  const [error, setError] = useState("");

  const fit = values.status === "Match fit";
  const change = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const data = {
      status: values.status,
      injuryName: fit ? "" : values.injuryName.trim(),
      dateInjured: fit ? "" : values.dateInjured,
      expectedReturn: fit ? "" : values.expectedReturn,
    };
    if (!fit && data.expectedReturn < data.dateInjured) {
      setError("Expected return can't be before the date injured.");
      return;
    }
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-brand-dark mb-4">
        Update fitness: {player.name}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Status" id="status">
          <select id="status" value={values.status} onChange={change("status")} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        {!fit && (
          <>
            <Field label="Injury name" id="injuryName">
              <input id="injuryName" value={values.injuryName} onChange={change("injuryName")} required className={inputClass} />
            </Field>
            <Field label="Date injured" id="dateInjured">
              <input id="dateInjured" type="date" value={values.dateInjured} onChange={change("dateInjured")} required className={inputClass} />
            </Field>
            <Field label="Expected return date" id="expectedReturn">
              <input id="expectedReturn" type="date" value={values.expectedReturn} onChange={change("expectedReturn")} required className={inputClass} />
            </Field>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button type="submit" className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark">
          Save status
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
