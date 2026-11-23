import { createLocalSend } from "./localApi";

const makeStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
  };
};

const post = (send, path, body) =>
  send(path, { method: "POST", body: JSON.stringify(body) });

test("starts with the seed data", async () => {
  const send = createLocalSend(makeStorage(), { players: [{ id: 1, name: "A" }] });
  const res = await send("/players");
  expect(await res.json()).toEqual([{ id: 1, name: "A" }]);
});

test("the built-in sample squad has players", async () => {
  const send = createLocalSend(makeStorage());
  const players = await (await send("/players")).json();
  expect(players.length).toBeGreaterThanOrEqual(18);
});

test("POST gives new items the next id and keeps them", async () => {
  const storage = makeStorage();
  const send = createLocalSend(storage, { matches: [] });
  const first = await (await post(send, "/matches", { opponent: "A" })).json();
  const second = await (await post(send, "/matches", { opponent: "B" })).json();
  expect([first.id, second.id]).toEqual([1, 2]);
  // a new send function on the same storage still sees the data
  const again = createLocalSend(storage, {});
  expect((await (await again("/matches")).json()).length).toBe(2);
});

test("POST keeps an id that is given (like a Firebase user id)", async () => {
  const send = createLocalSend(makeStorage(), {});
  await post(send, "/users", { id: "abc123", role: "Admin" });
  const res = await send("/users/abc123");
  expect(res.ok).toBe(true);
  expect((await res.json()).role).toBe("Admin");
});

test("GET of a missing item is a 404", async () => {
  const send = createLocalSend(makeStorage(), { users: [] });
  const res = await send("/users/nobody");
  expect(res.status).toBe(404);
  expect(res.ok).toBe(false);
});

test("PATCH changes only the given fields", async () => {
  const send = createLocalSend(makeStorage(), { players: [{ id: 1, name: "A", height: 180 }] });
  const res = await send("/players/1", { method: "PATCH", body: JSON.stringify({ name: "B" }) });
  expect(await res.json()).toEqual({ id: 1, name: "B", height: 180 });
});

test("PATCH of a missing item is a 404", async () => {
  const send = createLocalSend(makeStorage(), { players: [] });
  const res = await send("/players/9", { method: "PATCH", body: "{}" });
  expect(res.status).toBe(404);
});

test("DELETE removes the item", async () => {
  const send = createLocalSend(makeStorage(), { players: [{ id: 1 }, { id: 2 }] });
  await send("/players/1", { method: "DELETE" });
  expect(await (await send("/players")).json()).toEqual([{ id: 2 }]);
});

test("DELETE with _dependent also removes linked records", async () => {
  const send = createLocalSend(makeStorage(), {
    players: [{ id: 1 }],
    injuries: [{ id: 1, playerId: 1 }, { id: 2, playerId: 2 }],
    matches: [{ id: 5 }],
    performances: [{ id: 1, matchId: 5 }, { id: 2, matchId: 6 }],
  });
  await send("/players/1?_dependent=injuries", { method: "DELETE" });
  expect(await (await send("/injuries")).json()).toEqual([{ id: 2, playerId: 2 }]);
  await send("/matches/5?_dependent=performances", { method: "DELETE" });
  expect(await (await send("/performances")).json()).toEqual([{ id: 2, matchId: 6 }]);
});

test("DELETE of a missing item is a 404", async () => {
  const send = createLocalSend(makeStorage(), { players: [] });
  expect((await send("/players/1", { method: "DELETE" })).status).toBe(404);
});

test("an unknown collection is empty and unknown methods are a 404", async () => {
  const send = createLocalSend(makeStorage(), {});
  expect(await (await send("/things")).json()).toEqual([]);
  expect((await send("/things/1", { method: "PUT", body: "{}" })).status).toBe(404);
});

test("broken saved data does not crash", async () => {
  const storage = makeStorage();
  storage.setItem("team-manager-db", "not json");
  const send = createLocalSend(storage, {});
  expect(await (await send("/players")).json()).toEqual([]);
});
