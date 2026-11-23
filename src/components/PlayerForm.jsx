import { useState } from "react";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
const FEET = ["Right", "Left", "Both"];
const empty = {
  name: "",
  shirtNumber: "",
  dob: "",
  height: "",
  weight: "",
  position: "",
  nationality: "",
  preferredFoot: "",
};

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

export default function PlayerForm({ player, onSave, onCancel }) {
  const [values, setValues] = useState({ ...empty, ...player });
  const [error, setError] = useState("");

  const change = (field) => (e) => setValues({ ...values, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const data = {
      ...values,
      shirtNumber: Number(values.shirtNumber),
      height: Number(values.height),
      weight: values.weight === "" ? "" : Number(values.weight),
    };
    try {
      await onSave(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-brand-dark mb-4">
        {values.id ? "Edit player" : "Add player"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Name" id="name">
          <input id="name" value={values.name} onChange={change("name")} required className={inputClass} />
        </Field>
        <Field label="Shirt number" id="shirtNumber">
          <input id="shirtNumber" type="number" min="1" max="99" value={values.shirtNumber} onChange={change("shirtNumber")} required className={inputClass} />
        </Field>
        <Field label="Date of birth" id="dob">
          <input id="dob" type="date" value={values.dob} onChange={change("dob")} required className={inputClass} />
        </Field>
        <Field label="Height (cm)" id="height">
          <input id="height" type="number" min="100" max="250" value={values.height} onChange={change("height")} required className={inputClass} />
        </Field>
        <Field label="Weight (kg)" id="weight">
          <input id="weight" type="number" min="30" max="200" value={values.weight} onChange={change("weight")} className={inputClass} />
        </Field>
        <Field label="Position" id="position">
          <select id="position" value={values.position} onChange={change("position")} required className={inputClass}>
            <option value="">Choose position</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="Nationality" id="nationality">
          <input id="nationality" value={values.nationality} onChange={change("nationality")} className={inputClass} />
        </Field>
        <Field label="Preferred foot" id="preferredFoot">
          <select id="preferredFoot" value={values.preferredFoot} onChange={change("preferredFoot")} className={inputClass}>
            <option value="">Not set</option>
            {FEET.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </Field>
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="mt-4 flex gap-3">
        <button type="submit" className="bg-brand text-white rounded-lg px-4 py-2 font-medium hover:bg-brand-dark">
          Save player
        </button>
        <button type="button" onClick={onCancel} className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
