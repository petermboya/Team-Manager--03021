const styles = {
  "Match fit": "bg-brand-light text-brand-dark",
  Recovering: "bg-amber-100 text-amber-800",
  Injured: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status = "Match fit" }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
