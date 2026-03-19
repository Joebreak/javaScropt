import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CannotStopRoom.css";
import { useRoomData } from "./useRoomData";

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
  const { room, rank } = location.state || {};

  const safeRoom = room || "default";
  const { data, loading, refresh } = useRoomData(0, safeRoom);
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const memberCount = data?.members != null ? Number(data.members) : 0;
  const remainder = memberCount || 4;
  const currentPlayerRank = (Number(lastRound) % remainder) + 1;
  const isMyTurn =
    memberCount === 1 ||
    (rank != null && Number(rank) === currentPlayerRank);

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
    // 只能在輪到自己，且「本回合尚未選組合」時才能再擲
    if (!isMyTurn) return;
    if (phase !== "idle") return;
    if (phase === "ended") return;

    // 新的一回合第一次擲骰：從上一輪存檔的位置開始往上加
    if (dice == null) {
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

    // 檢查這次擲骰是否有任何合法前進，若完全沒有就是爆掉：本回合進度清除
    const hasAnyMove = opts.some((opt) => {
      const [s1, s2] = opt.sums;
      const can1 = canAdvanceSum(s1);
      const can2 = canAdvanceSum(s2);
      const canBoth = can1 && can2 && canAdvanceCombo(s1, s2);
      return can1 || can2 || canBoth;
    });

    if (!hasAnyMove) {
      // 爆掉：清除本回合紀錄，回到上一輪存檔
      setTurnTracks(savedTracks);
      setChosenRoutes([]);
      setDice(null);
      setOptions([]);
      setPhase("bust");
      setMessage("這次沒有任何合法的前進組合，本回合爆掉，進度清除。");
      return;
    }

    setDice(diceArr);
    setOptions(opts);
    setPhase("deciding");
  };

  const canAdvanceSum = (sum) => {
    if (!TRACK_LENGTH[sum]) return false;
    if (chosenRoutes.includes(sum)) return true;
    return chosenRoutes.length < 3;
  };

  const canAdvanceCombo = (s1, s2) => {
    if (!TRACK_LENGTH[s1] || !TRACK_LENGTH[s2]) return false;
    const newSums = [s1, s2].filter((s) => !chosenRoutes.includes(s));
    const newCount = new Set(newSums).size;
    return chosenRoutes.length + newCount <= 3;
  };

  // 實際套用某些和（可以是一條或兩條）
  const handleChooseMove = (moveSums) => {
    if (!isMyTurn) return;
    if (phase !== "deciding") return;
    const validSums = moveSums.filter((s) => TRACK_LENGTH[s]);
    if (validSums.length === 0) {
      setMessage("這組選擇無法前進任何路線，請重新擲骰。");
      setPhase("idle");
      return;
    }

    const newChosen = Array.from(new Set([...chosenRoutes, ...validSums]));

    const nextTurnTracks = { ...turnTracks };
    for (const s of validSums) {
      const len = TRACK_LENGTH[s];
      const prev = nextTurnTracks[s] || 0;
      nextTurnTracks[s] = Math.min(len, prev + 1);
    }

    setChosenRoutes(newChosen);
    setTurnTracks(nextTurnTracks);
    setPhase("waitingDecision");
    setMessage(
      `你選擇了要前進：${validSums.join("、")}，決定要繼續還是停下來？`
    );

    const finishedRoutes = newChosen.filter(
      (s) => nextTurnTracks[s] >= TRACK_LENGTH[s]
    );
    if (finishedRoutes.length >= 3) {
      setPhase("ended");
      setMessage(`恭喜完成 3 條路線，獲勝！`);
    }
  };

  // 停下來：把本回合的 turnTracks 存回 savedTracks
  const handleStop = () => {
    setSavedTracks(turnTracks);
    setPhase("idle");
    setMessage("已存檔，下次從現在的位置繼續爬。");
  };

  // 繼續擲：直接立刻擲下一次，不需要再按一次「擲 4 顆骰子」
  const handleContinue = () => {
    if (!isMyTurn) return;
    if (phase !== "waitingDecision") return;
    if (phase === "ended") return;

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

    const hasAnyMove = opts.some((opt) => {
      const [s1, s2] = opt.sums;
      const can1 = canAdvanceSum(s1);
      const can2 = canAdvanceSum(s2);
      const canBoth = can1 && can2 && canAdvanceCombo(s1, s2);
      return can1 || can2 || canBoth;
    });

    if (!hasAnyMove) {
      setTurnTracks(savedTracks);
      setChosenRoutes([]);
      setDice(null);
      setOptions([]);
      setPhase("bust");
      setMessage("這次沒有任何合法的前進組合，本回合爆掉，進度清除。");
      return;
    }

    setDice(diceArr);
    setOptions(opts);
    setPhase("deciding");
    setMessage("已自動擲骰，請選擇要前進的路線。");
  };

  const barFillClass =
    (sum) =>
    `cannotStop-track-bar-fill ${sum === 7 ? "cannotStop-track-bar-fill--seven" : sum >= 6 && sum <= 8 ? "cannotStop-track-bar-fill--mid" : "cannotStop-track-bar-fill--edge"}`;

  return (
    <div className="cannotStop-container">
      <p className="cannotStop-sub">
        房間: {safeRoom}{memberCount > 0 ? ` · ${memberCount} 人` : ""}
      </p>
      {memberCount >= 2 && (
        <p className="cannotStop-sub">
          當前輪到：玩家{currentPlayerRank}
          {isMyTurn && "（你）"}
        </p>
      )}
      {loading && <p className="cannotStop-sub">載入中…</p>}
      {message && <p className="cannotStop-message">{message}</p>}

      <div className="cannotStop-card">
        <p className="cannotStop-hint">
          {isMyTurn
            ? "輪到你時按「擲骰子」。"
            : "目前不是你的回合，請等待其他玩家。"}
        </p>
        {isMyTurn && (
          <>
            <button
              onClick={phase === "waitingDecision" ? handleContinue : handleRoll}
              className="cannotStop-btn"
              disabled={phase === "deciding"}
            >
              {phase === "waitingDecision"
                ? "繼續擲（不存檔）"
                : phase === "deciding"
                  ? "請先選擇路線"
                  : "擲 4 顆骰子"}
            </button>
            {phase === "waitingDecision" && (
              <button
                onClick={handleStop}
                className="cannotStop-btn-danger"
                disabled={!isMyTurn}
              >
                停下來（存檔）
              </button>
            )}
          </>
        )}
      </div>

      {/* 顯示本次骰子與 3 種選擇 */}
      {dice && (
        <div className="cannotStop-card">
          <div className="cannotStop-dice-label">
            本次骰子：{dice.join(" , ")}
          </div>
          <div className="cannotStop-options">
            {options.map((opt) => {
              const [p1a, p1b] = opt.pairs[0];
              const [p2a, p2b] = opt.pairs[1];
              const [s1, s2] = opt.sums;
              const can1 = canAdvanceSum(s1);
              const can2 = canAdvanceSum(s2);
              const canBoth = can1 && can2 && canAdvanceCombo(s1, s2);

              const buttons = [];

              if (canBoth) {
                buttons.push(
                  <button
                    key={`${opt.id}-both`}
                    onClick={() => handleChooseMove([s1, s2])}
                    className="cannotStop-btn-secondary"
                    disabled={!isMyTurn || phase !== "deciding"}
                  >
                    骰{p1a}({dice[p1a - 1]}) + 骰{p1b}({dice[p1b - 1]}) = {s1}
                    {" ， "}
                    骰{p2a}({dice[p2a - 1]}) + 骰{p2b}({dice[p2b - 1]}) = {s2}
                  </button>
                );
              } else {
                if (can1) {
                  buttons.push(
                    <button
                      key={`${opt.id}-s1`}
                      onClick={() => handleChooseMove([s1])}
                      className="cannotStop-btn-secondary"
                      disabled={!isMyTurn || phase !== "deciding"}
                    >
                      只前進和 {s1}（骰{p1a}+骰{p1b}）
                    </button>
                  );
                }
                if (can2) {
                  buttons.push(
                    <button
                      key={`${opt.id}-s2`}
                      onClick={() => handleChooseMove([s2])}
                      className="cannotStop-btn-secondary"
                      disabled={!isMyTurn || phase !== "deciding"}
                    >
                      只前進和 {s2}（骰{p2a}+骰{p2b}）
                    </button>
                  );
                }
                if (!can1 && !can2) {
                  buttons.push(
                    <button
                      key={`${opt.id}-none`}
                      className="cannotStop-btn-secondary"
                      disabled
                    >
                      此組合無法前進任何路線
                    </button>
                  );
                }
              }

              return <React.Fragment key={opt.id}>{buttons}</React.Fragment>;
            })}
          </div>
        </div>
      )}

      {/* 路徑高度視覺化（2~12） */}
      <div className="cannotStop-card cannotStop-card-scroll">
        {trackConfig.map((t) => {
          const current =
            (phase === "ended" ? savedTracks[t.sum] : turnTracks[t.sum]) || 0;
          const ratio = Math.min(1, current / t.length);
          const percent = Math.round(ratio * 100);
          return (
            <div key={t.sum} className="cannotStop-track-row">
              <div className="cannotStop-track-header">
                <span>和 {t.sum}</span>
                <span>
                  {current}/{t.length} ({percent}%)
                </span>
              </div>
              <div className="cannotStop-track-bar-wrap">
                <div
                  className={barFillClass(t.sum)}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => navigate("/")} className="cannotStop-btn">
        回首頁
      </button>
    </div>
  );
}
