import { pagesFor } from "./permissions";

test("each role only gets its own pages", () => {
  expect(pagesFor("Admin").map((p) => p.id)).toEqual(["players"]);
  expect(pagesFor("Medical team").map((p) => p.id)).toEqual(["fitness"]);
  expect(pagesFor("Assistant coach").map((p) => p.id)).toEqual(["performance"]);
  expect(pagesFor("Head coach").length).toBe(2);
});

test("unknown roles get nothing", () => {
  expect(pagesFor("Fan")).toEqual([]);
});
