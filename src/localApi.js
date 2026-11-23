import { SEED } from "./demoData";

// A tiny stand-in for json-server that keeps the data in the browser (localStorage).
// Used in demo mode, for example on GitHub Pages where no server can run.
const KEY = "team-manager-db";
const respond = (status, body) => ({ ok: status < 400, status, json: async () => body });
const singular = (name) => name.replace(/(es|s)$/, ""); // players -> player, matches -> match

export function createLocalSend(storage = window.localStorage, seed = SEED) {
  const load = () => {
    try {
      return JSON.parse(storage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  };
  const save = (db) => storage.setItem(KEY, JSON.stringify(db));

  if (storage.getItem(KEY) === null) save(seed);

  // Works like fetch(path, options) and answers like json-server would
  return async function send(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const [pathname, query = ""] = path.split("?");
    const [, collection, id] = pathname.split("/");
    const db = load();
    const list = db[collection] || [];
    const index = id === undefined ? -1 : list.findIndex((item) => String(item.id) === String(id));
    const body = options.body ? JSON.parse(options.body) : {};

    if (method === "GET") {
      if (id === undefined) return respond(200, list);
      return index === -1 ? respond(404, {}) : respond(200, list[index]);
    }

    if (method === "POST" && id === undefined) {
      const newId = body.id ?? Math.max(0, ...list.map((item) => Number(item.id) || 0)) + 1;
      const item = { ...body, id: newId };
      db[collection] = [...list, item];
      save(db);
      return respond(201, item);
    }

    if (method === "PATCH" && index !== -1) {
      const item = { ...list[index], ...body, id: list[index].id };
      db[collection] = list.map((existing, i) => (i === index ? item : existing));
      save(db);
      return respond(200, item);
    }

    if (method === "DELETE" && index !== -1) {
      db[collection] = list.filter((_, i) => i !== index);
      const link = `${singular(collection)}Id`;
      new URLSearchParams(query).getAll("_dependent").forEach((dependent) => {
        db[dependent] = (db[dependent] || []).filter((item) => String(item[link]) !== String(id));
      });
      save(db);
      return respond(200, {});
    }

    return respond(404, {});
  };
}
