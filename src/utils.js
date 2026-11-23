// Works out a player's age from their date of birth (YYYY-MM-DD)
export function calcAge(dob, today = new Date()) {
  const born = new Date(dob);
  let age = today.getFullYear() - born.getUTCFullYear();
  const monthDiff = today.getMonth() - born.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getUTCDate())) age--;
  return age;
}

// Today's date as YYYY-MM-DD (in the user's own time zone)
export function todayISO(date = new Date()) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

// Number of days from one YYYY-MM-DD date to another
export function daysBetween(from, to) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

// Turns an injury record into "10 days" (out) and "9 days to go" (left)
export function describeTimeline(injury, today = todayISO()) {
  if (!injury || injury.status === "Match fit" || !injury.dateInjured || !injury.expectedReturn) {
    return null;
  }
  const days = (n) => `${n} day${n === 1 ? "" : "s"}`;
  const out = daysBetween(injury.dateInjured, today);
  const left = daysBetween(today, injury.expectedReturn);
  return {
    out: days(Math.max(out, 0)),
    left: left > 0 ? `${days(left)} to go` : left === 0 ? "Due back today" : `Overdue by ${days(-left)}`,
  };
}
