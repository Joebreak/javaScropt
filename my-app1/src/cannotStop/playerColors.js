export const PLAYER_COLORS = [
  "#e53935",
  "#1e88e5",
  "#43a047",
  "#00acc1",
  "#6d4c41",
];

/** 1-based 玩家序號 → 色（與盤面一致） */
export function colorForPlayerRank(rank) {
  const r = Number(rank);
  if (!Number.isFinite(r) || r < 1) return "#9e9e9e";
  return PLAYER_COLORS[(r - 1) % PLAYER_COLORS.length];
}
