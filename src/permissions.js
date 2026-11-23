// Which pages each role is allowed to see
export const PAGES = {
  Admin: [{ id: "players", label: "Players" }],
  "Medical team": [{ id: "fitness", label: "Fitness status" }],
  "Head coach": [
    { id: "overview", label: "Squad overview" },
    { id: "selection", label: "Pick squad" },
  ],
  "Assistant coach": [{ id: "performance", label: "Match performance" }],
};

export const pagesFor = (role) => PAGES[role] || [];
