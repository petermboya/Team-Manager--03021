import { getProfile, saveProfile, getAll, createItem, updateItem, deleteItem } from "./api";

afterEach(() => vi.restoreAllMocks());

const okResponse = (data) => ({ ok: true, status: 200, json: async () => data });

test("getProfile returns the profile", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okResponse({ id: "u1" })));
  expect(await getProfile("u1")).toEqual({ id: "u1" });
});

test("getProfile returns null when not found", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  expect(await getProfile("u1")).toBeNull();
});

test("getProfile throws when the server fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
  await expect(getProfile("u1")).rejects.toThrow("Could not reach the server");
});

test("saveProfile posts the profile", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: "u1" }));
  vi.stubGlobal("fetch", fetchMock);
  await saveProfile({ id: "u1", role: "Admin" });
  expect(fetchMock.mock.calls[0][1].method).toBe("POST");
});

test("saveProfile throws on failure", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  await expect(saveProfile({})).rejects.toThrow("Could not save");
});

test("getAll fetches a list", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse([{ id: 1 }]));
  vi.stubGlobal("fetch", fetchMock);
  expect(await getAll("players")).toEqual([{ id: 1 }]);
  expect(fetchMock.mock.calls[0][0]).toContain("/players");
});

test("createItem uses POST", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 2 }));
  vi.stubGlobal("fetch", fetchMock);
  await createItem("players", { name: "A" });
  expect(fetchMock.mock.calls[0][1].method).toBe("POST");
});

test("updateItem uses PATCH on the item", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse({ id: 2 }));
  vi.stubGlobal("fetch", fetchMock);
  await updateItem("players", 2, { name: "B" });
  expect(fetchMock.mock.calls[0][0]).toContain("/players/2");
  expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
});

test("deleteItem uses DELETE", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
  vi.stubGlobal("fetch", fetchMock);
  await deleteItem("players", 2);
  expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
});

test("requests throw when the server fails", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  await expect(getAll("players")).rejects.toThrow("Request failed");
});

test("deleteItem can also delete linked records", async () => {
  const fetchMock = vi.fn().mockResolvedValue(okResponse({}));
  vi.stubGlobal("fetch", fetchMock);
  await deleteItem("players", 2, ["injuries"]);
  expect(fetchMock.mock.calls[0][0]).toContain("/players/2?_dependent=injuries");
});
