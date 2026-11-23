import { calcAge, todayISO, daysBetween, describeTimeline } from "./utils";

test("age before the birthday", () => {
  expect(calcAge("2000-06-15", new Date(2026, 5, 14))).toBe(25);
});

test("age on the birthday", () => {
  expect(calcAge("2000-06-15", new Date(2026, 5, 15))).toBe(26);
});

test("age when the birth month has not come yet", () => {
  expect(calcAge("2000-09-01", new Date(2026, 5, 15))).toBe(25);
});

test("todayISO formats a date", () => {
  expect(todayISO(new Date(2026, 0, 5))).toBe("2026-01-05");
});

test("daysBetween counts days, also across months", () => {
  expect(daysBetween("2026-11-11", "2026-11-21")).toBe(10);
  expect(daysBetween("2026-10-30", "2026-11-02")).toBe(3);
  expect(daysBetween("2026-11-21", "2026-11-11")).toBe(-10);
});

test("describeTimeline shows days out and days to go", () => {
  const injury = { status: "Injured", dateInjured: "2026-11-11", expectedReturn: "2026-11-30" };
  expect(describeTimeline(injury, "2026-11-21")).toEqual({ out: "10 days", left: "9 days to go" });
});

test("describeTimeline handles singular days, due today and overdue", () => {
  const base = { status: "Recovering", dateInjured: "2026-11-20" };
  expect(describeTimeline({ ...base, expectedReturn: "2026-11-22" }, "2026-11-21")).toEqual({ out: "1 day", left: "1 day to go" });
  expect(describeTimeline({ ...base, expectedReturn: "2026-11-21" }, "2026-11-21").left).toBe("Due back today");
  expect(describeTimeline({ ...base, expectedReturn: "2026-11-19" }, "2026-11-21").left).toBe("Overdue by 2 days");
});

test("describeTimeline returns null for match fit or no record", () => {
  expect(describeTimeline(undefined)).toBeNull();
  expect(describeTimeline({ status: "Match fit" })).toBeNull();
});
