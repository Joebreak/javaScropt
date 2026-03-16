import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * CannotStopRoom — 本地桌遊邏輯（Cloudflare 只負責傳輸）
 *
 * 規則簡化：
 * - 輪流擲 4 顆骰子，由 Durable Object 計算「兩兩總和」路徑 2~12 的前進高度
 * - 中間的路徑（例如 6,7,8）比較長，但比較容易被骰到
 * - 多人時透過 WebSocket 同步狀態；一個人時也可以自己玩
 */
export default function CannotStopRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rank } = location.state || {};

  // 房間號碼固定 6666，所有人進來都在同一個聊天房
  const roomId = "6666";

  const [playerName, setPlayerName] = useState(`玩家-${rank || "?"}`);

  // 永久存檔：已經確定的高度
  const [savedTracks, setSavedTracks] = useState({}); // { sum: height }
  // 本回合暫存：從 savedTracks 出發加上本回合的進度
  const [turnTracks, setTurnTracks] = useState({}); // { sum: height }
  // 本回合選擇的路線（最多 3 條）
  const [chosenRoutes, setChosenRoutes] = useState([]); // [sum,...]

  // 骰子與選項
  const [dice, setDice] = useState(null); // [d1,d2,d3,d4]
  const [options, setOptions] = useState([]); // [{id, sums:[s1,s2]}]
  const [phase, setPhase] = useState("idle"); // idle | rolled | deciding | waitingDecision | bust | ended
  const [message, setMessage] = useState("");

  // 每條路徑長度配置
  const TRACK_LENGTH = useMemo(
    () => ({
      2: 3,
      3: 4,
      4: 5,
      5: 6,
      6: 7,
      7: 8,
      8: 7,
      9: 6,
      10: 5,
      11: 4,
      12: 3,
    }),
    []
  );

  const trackConfig = useMemo(
    () => [
      { sum: 2, length: 3 },
      { sum: 3, length: 4 },
      { sum: 4, length: 5 },
      { sum: 5, length: 6 },
      { sum: 6, length: 7 },
      { sum: 7, length: 8 },
      { sum: 8, length: 7 },
      { sum: 9, length: 6 },
      { sum: 10, length: 5 },
      { sum: 11, length: 4 },
      { sum: 12, length: 3 },
    ],
    []
  );

  // 擲 4 顆骰子 + 產生 3 種組合
  const handleRoll = () => {
    if (phase === "ended") return;
    // 新回合開始時，從永久存檔複製一份作為本回合基準
    if (phase === "idle" || phase === "waitingDecision" || phase === "bust") {
      setTurnTracks(savedTracks);
      setMessage("");
    }

    const d = () => 1 + Math.floor(Math.random() * 6);
    const d1 = d();
    const d2 = d();
    const d3 = d();
    const d4 = d();
    const diceArr = [d1, d2, d3, d4];

    const opts = [
      { id: 0, sums: [d1 + d2, d3 + d4], pairs: [[1, 2], [3, 4]] },
      { id: 1, sums: [d1 + d3, d2 + d4], pairs: [[1, 3], [2, 4]] },
      { id: 2, sums: [d1 + d4, d2 + d3], pairs: [[1, 4], [2, 3]] },
    ];

    setDice(diceArr);
    setOptions(opts);
    setPhase("deciding");
  };

  // 套用某一種組合（不考慮多人 / 換人，只做邏輯）
  const handleChooseOption = (opt) => {
    if (!opt || !Array.isArray(opt.sums)) return;
    const sums = opt.sums;

    // 檢查路線長度表
    const validSums = sums.filter((s) => TRACK_LENGTH[s]);
    if (validSums.length !== 2) {
      setMessage("這組組合不合法（不在 2~12 之間）");
      setPhase("bust");
      // 本回合進度清掉，回到永久存檔
      setTurnTracks(savedTracks);
      return;
    }

    // 計算新的 chosenRoutes（不能超過 3 條）
    const newChosen = Array.from(new Set([...chosenRoutes, ...validSums]));
    if (newChosen.length > 3) {
      // 超過 3 條，視為「選錯路」，本回合作廢
      setMessage("超過 3 條路線，本回合作廢，回到上一輪存檔。");
      setTurnTracks(savedTracks);
      setPhase("bust");
      return;
    }

    // 實際更新本回合高度
    const nextTurnTracks = { ...turnTracks };
    for (const s of validSums) {
      const len = TRACK_LENGTH[s];
      const prev = nextTurnTracks[s] || 0;
      nextTurnTracks[s] = Math.min(len, prev + 1);
    }

    setChosenRoutes(newChosen);
    setTurnTracks(nextTurnTracks);
    setPhase("waitingDecision");
    setMessage(`你選擇了組合 ${validSums[0]} / ${validSums[1]}，決定要繼續還是停下來？`);

    // 勝利檢查：有 3 條路的高度都達到終點
    const finishedRoutes = newChosen.filter(
      (s) => nextTurnTracks[s] >= TRACK_LENGTH[s]
    );
    if (finishedRoutes.length >= 3) {
      setPhase("ended");
      setMessage(`恭喜 ${playerName} 完成了 3 條路線，獲勝！`);
    }
  };

  // 停下來：把本回合的 turnTracks 存回 savedTracks
  const handleStop = () => {
    setSavedTracks(turnTracks);
    setPhase("idle");
    setMessage("已存檔，下次從現在的位置繼續爬。");
  };

  // 繼續擲：不動 savedTracks，保持 turnTracks 作為基準，phase 回到 idle→roll
  const handleContinue = () => {
    setPhase("idle");
    setMessage("繼續挑戰，本回合進度暫時保留，若之後爆掉會回到上一次存檔。");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CannotStop 桌遊（本地邏輯）</h2>
      <p style={styles.sub}>
        房間: {roomId}
      </p>

      {message && <p style={{ color: "#333", marginBottom: 8 }}>{message}</p>}

      {/* 路徑高度視覺化 */}
      <div style={{ ...styles.card, maxHeight: 360, overflowY: "auto" }}>
        {trackConfig.map((t) => {
          const current =
            (phase === "idle" || phase === "ended" || phase === "bust"
              ? savedTracks[t.sum]
              : turnTracks[t.sum]) || 0;
          const ratio = Math.min(1, current / t.length);
          const percent = Math.round(ratio * 100);
          return (
            <div key={t.sum} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>和 {t.sum}</span>
                <span>
                  {current}/{t.length} ({percent}%)
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: "#eee",
                  borderRadius: 4,
                  overflow: "hidden",
                  marginTop: 4,
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background:
                      t.sum === 7 ? "#ff7043" : t.sum >= 6 && t.sum <= 8 ? "#4caf50" : "#4f8cff",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.card}>
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="顯示名稱"
          style={styles.input}
        />
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          輪到你時按「擲骰子」，實際骰值與高度計算交給 Durable Object，其他玩家會即時看到更新。
        </p>
        <button onClick={handleRoll} style={styles.btn}>
          擲 4 顆骰子
        </button>
      </div>

      {/* 顯示本次骰子與 3 種選擇 */}
      {dice && (
        <div style={styles.card}>
          <div style={{ marginBottom: 8 }}>
            本次骰子：{dice.join(" , ")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleChooseOption(opt)}
                style={styles.btnSecondary}
              >
                {/* 顯示每一組是哪些骰子相加 */}
                {(() => {
                  const [p1a, p1b] = opt.pairs[0];
                  const [p2a, p2b] = opt.pairs[1];
                  const [s1, s2] = opt.sums;
                  return (
                    <>
                      骰{p1a}({dice[p1a - 1]}) + 骰{p1b}({dice[p1b - 1]}) = {s1}
                      {" ， "}
                      骰{p2a}({dice[p2a - 1]}) + 骰{p2b}({dice[p2b - 1]}) = {s2}
                    </>
                  );
                })()}
              </button>
            ))}
          </div>
          {phase === "waitingDecision" && (
            <div style={{ marginTop: 12 }}>
              <button onClick={handleStop} style={styles.btnDanger}>
                停下來（存檔）
              </button>
              <button
                onClick={handleContinue}
                style={{ ...styles.btn, marginLeft: 8 }}
              >
                繼續擲
              </button>
            </div>
          )}
        </div>
      )}

      <button onClick={() => navigate("/")} style={styles.btn}>
        回首頁
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    maxWidth: 560,
    margin: "0 auto",
  },
  title: { color: "#1976d2", marginBottom: 4 },
  sub: { fontSize: 12, color: "#666", marginBottom: 16 },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    marginBottom: 16,
  },
  pre: { fontSize: 12, overflow: "auto", margin: 0 },
  input: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    width: 160,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  btn: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#888",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#c00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
