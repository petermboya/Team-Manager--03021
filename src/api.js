// Small helpers for talking to json-server (our REST API)
import { createLocalSend } from "./localApi";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// A production build with no API address (e.g. GitHub Pages) runs in demo mode:
// the data is kept in the browser instead of json-server.
export const USE_LOCAL = !import.meta.env.DEV && !import.meta.env.VITE_API_URL;
const send = USE_LOCAL ? createLocalSend() : (path, options) => fetch(`${API}${path}`, options);

const JSON_HEADERS = { "Content-Type": "application/json" };

// ---- user profiles (role saved per account) ----
export async function getProfile(uid) {
  const res = await send(`/users/${uid}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not reach the server. Is `npm start` running?");
  return res.json();
}

export async function saveProfile(profile) {
  const res = await send("/users", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error("Could not save your profile.");
  return res.json();
}

// ---- generic helpers: GET, POST, PATCH, DELETE ----
async function request(path, options) {
  const res = await send(path, options);
  if (!res.ok) throw new Error("Request failed. Is `npm start` running?");
  return res.json();
}

export const getAll = (resource) => request(`/${resource}`);

export const createItem = (resource, item) =>
  request(`/${resource}`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(item) });

export const updateItem = (resource, id, changes) =>
  request(`/${resource}/${id}`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(changes),
  });

// "dependents" also deletes linked records, e.g. a player's injuries (json-server _dependent)
export const deleteItem = (resource, id, dependents = []) => {
  const query = dependents.map((d) => `_dependent=${d}`).join("&");
  return request(`/${resource}/${id}${query ? `?${query}` : ""}`, { method: "DELETE" });
};
