import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CannotStopRoom.css";
import { useRoomData } from "./useRoomData";
import { getApiUrl } from "../config/api";
import { useRoomWebSocket } from "../ws/useRoomWebSocket";
import DiceHistoryList from "./DiceHistoryList";
import { PLAYER_COLORS, colorForPlayerRank } from "./playerColors";

/** 本回合尚未存檔的進度／已選路線提示色 */
const PENDING_ROUTE_COLOR = "#ff9800";

/** 非自己回合時，對方 WS 剛選的路線提示色（與橘色、玩家色區隔） */
const REMOTE_PICK_ROUTE_COLOR = "#7c4dff";

/**
 * 各路線格數上限（封頂、WS、畫面條數）— 只改這一份即可。
 * TRACK_LENGTH / trackConfig 由此衍生，勿再重複寫數字。
 */
const TRACK_CAP = {
  2: 3,
  3: 5,
  4: 7,
  5: 9,
  6: 11,
  7: 13,
  8: 11,
  9: 9,
  10: 7,
  11: 5,
  12: 3,
};

const TRACK_LENGTH = TRACK_CAP;

const trackConfig = Object.keys(TRACK_CAP)
  .map(Number)
  .sort((a, b) => a - b)
  .map((sum) => ({ sum, length: TRACK_CAP[sum] }));

/** 從廣播文字解析「前進：和7、和8…」（舊格式，無數量）→ [7,8] */
function parseForwardSumsFromText(text) {
  const s = String(text || "");
  if (!s.includes("前進")) return [];
  const sums = [];
  const re = /和\s*(\d{1,2})(?!\s*[:：])/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    const n = Number(m[1]);
    if (n >= 2 && n <= 12) sums.push(n);
  }
  return [...new Set(sums)];
}

/**
 * 新格式：前進｜和6:2，和7:1（絕對高度）
 * 舊格式：無「和x:y」時改為每條 +1
 */
function parseForwardMovesFromText(text) {
  const s = String(text || "");
  if (!s.includes("前進")) return { moves: [], pickSums: [] };
  const reAbs = /和\s*(\d{1,2})\s*[:：]\s*(\d+)/g;
  const moves = [];
  let m;
  while ((m = reAbs.exec(s)) !== null) {
    const num = Number(m[1]);
    const count = Number(m[2]);
    if (num >= 2 && num <= 12 && Number.isFinite(count) && count >= 0) {
      const cap = TRACK_CAP[num] || 12;
      moves.push({ num, count: Math.min(cap, count) });
    }
  }
  if (moves.length) {
    return {
      moves,
      pickSums: [...new Set(moves.map((x) => x.num))],
    };
  }
  const legacy = parseForwardSumsFromText(s);
  return {
    moves: legacy.map((num) => ({ num, count: null })),
    pickSums: legacy,
  };
}

function listToTrackMap(list) {
  const m = {};
  if (!Array.isArray(list)) return m;
  for (const item of list) {
    if (!item || item.num == null) continue;
    const n = Number(item.num);
    const c = Number(item.count);
    if (n >= 2 && n <= 12 && Number.isFinite(c) && c > 0) {
      m[n] = c;
    }
  }
  return m;
}

/** 爆掉回合：最後一筆為本次四顆 + 此後綴（前面仍為本回合已擲，格式同 handleStop） */
const BUST_DICE_SUFFIX = "（爆掉）";

function buildBustDicePayload(turnDiceRollsSnapshot, diceFour) {
  const arr = Array.isArray(diceFour) ? diceFour : [];
  const last = `${arr.join(",")}${BUST_DICE_SUFFIX}`;
  return [...(Array.isArray(turnDiceRollsSnapshot) ? turnDiceRollsSnapshot : []), last];
}

/** 盤面 map → POST 用 list（僅 count>0）— 爆掉時送「上一輪存檔」，data.dice 仍含本回合擲骰 + 最後一筆爆掉 */
function trackMapToList(tracks) {
  const list = [];
  if (!tracks || typeof tracks !== "object") return list;
  for (let num = 2; num <= 12; num++) {
    const count = tracks[num] || 0;
    if (count > 0) list.push({ num, count });
  }
  return list;
}

/** 回合紀錄 data 可能是 JSON 字串 */
function parseRecData(raw) {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) return raw;
  return null;
}

/** 該玩家已「走完」的路線數（高度 >= 該路和長） */
function countCompletedRoutesForPlayer(tracks) {
  if (!tracks || typeof tracks !== "object") return 0;
  let n = 0;
  for (let s = 2; s <= 12; s++) {
    const cap = TRACK_LENGTH[s];
    if (!cap) continue;
    if ((tracks[s] || 0) >= cap) n++;
  }
  return n;
}

/** 任一玩家某路線已封頂 → 其餘玩家該路線進度視為 0（Cannot Stop 佔領規則） */
function applyTrackCompletionKnockout(byRank) {
  const out = {};
  for (const k of Object.keys(byRank)) {
    const r = Number(k);
    if (!Number.isFinite(r)) continue;
    out[r] = { ...(byRank[k] || {}) };
  }
  const ranks = Object.keys(out).map(Number).filter(Number.isFinite);
  for (let s = 2; s <= 12; s++) {
    const cap = TRACK_CAP[s];
    if (!cap) continue;
    const hasFinisher = ranks.some((r) => (out[r][s] || 0) >= cap);
    if (!hasFinisher) continue;
    for (const r of ranks) {
      if ((out[r][s] || 0) < cap) {
        const row = { ...out[r] };
        delete row[s];
        out[r] = row;
      }
    }
  }
  return out;
}

/** 從「擲骰：1、2、3、4…」「繼續擲骰：…」解析四顆骰 */
function parseDiceFromRollText(text) {
  const s = String(text || "");
  const m = s.match(/(?:擲骰|繼續擲骰)\s*[：:]\s*([\d、,，\s]+)/);
  if (!m) return null;
  const nums = m[1]
    .split(/[、,，\s]+/)
    .map((x) => Number(String(x).trim()))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
  return nums.length === 4 ? nums : null;
}

function buildDiceOptions(diceArr) {
  if (!Array.isArray(diceArr) || diceArr.length !== 4) return [];
  const [d1, d2, d3, d4] = diceArr;
  return [
    { id: 0, sums: [d1 + d2, d3 + d4], pairs: [[1, 2], [3, 4]] },
    { id: 1, sums: [d1 + d3, d2 + d4], pairs: [[1, 3], [2, 4]] },
    { id: 2, sums: [d1 + d4, d2 + d3], pairs: [[1, 4], [2, 3]] },
  ];
}

const TURN_SESSION_V = 1;

function turnSessionStorageKey(room, rank) {
  return `cannotStop_turn_${String(room)}_${String(rank)}`;
}

function clearTurnSessionStorage(room, rank) {
  try {
    localStorage.removeItem(turnSessionStorageKey(room, rank));
  } catch {
    /* ignore */
  }
}

function withAlpha(hex, a) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

/** 回合紀錄：data 可為數字（舊）或 { currentPlayerRank, dice } */
function recordPlayerRankFromRec(rec) {
  if (!rec || rec.data == null) return NaN;
  const d = rec.data;
  if (typeof d === "object" && !Array.isArray(d)) {
    return Number(d.currentPlayerRank);
  }
  return Number(d);
}

/** WS 的 name 可能是 "2" 或 "玩家2" */
function parseSenderRank(name) {
  if (name == null || name === "") return NaN;
  const n = Number(name);
  if (Number.isFinite(n)) return n;
  const m = String(name).match(/玩家\s*(\d+)/);
  if (m) return Number(m[1]);
  return NaN;
}

/**
 * CannotStopRoom — 本地桌遊邏輯（Cloudflare 只負責傳輸）
 *
 * 規則簡化：
 * - 輪流擲 4 顆骰子，由 Durable Object 計算「兩兩總和」路徑 2~12 的前進高度
 * - 中間的路徑（例如 6,7,8）比較長，但比較容易被骰到
 * - 多人時透過 WebSocket 同步狀態；一個人時也可以自己玩
 * - 任一路線若有玩家已爬到該路頂，其餘玩家該路線進度作廢（畫面與本回合暫存會清掉）
 */
export default function CannotStopRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};

  const safeRoom = room || "default";
  const { data, loading, refresh, lastFetchOkAt, lastFetchError } = useRoomData(
    0,
    safeRoom
  );
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const memberCount = data?.members != null ? Number(data.members) : 0;
  const remainder = memberCount || 4;
  /** 下一手玩家：(已完成最大回合號 % 人數) + 1；與後端換人邏輯一致 */
  const lrn = Number(lastRound);
  const currentPlayerRankFromRounds =
    Number.isFinite(lrn) && lrn >= 0 ? (lrn % remainder) + 1 : 1;
  /**
   * 當前輪到誰：有回合紀錄時只信 list 推算（meta.currentPlayerRank 常未更新 → 全變玩家1紅色）
   * 尚無任何回合時才用 meta 或推算
   */
  const currentPlayerRank =
    data?.list?.length > 0
      ? currentPlayerRankFromRounds
      : Number.isFinite(Number(data?.meta?.currentPlayerRank))
        ? Number(data.meta.currentPlayerRank)
        : currentPlayerRankFromRounds;
  const isMyTurn =
    memberCount === 1 ||
    (rank != null && Number(rank) === currentPlayerRank);

  const myRank = Number(rank);
  /** 頂欄色塊：登入座位，非「輪到誰」 */
  const loginPlayerColor = useMemo(
    () =>
      Number.isFinite(myRank) && myRank >= 1
        ? colorForPlayerRank(myRank)
        : "#9e9e9e",
    [myRank]
  );

  const useWs = memberCount > 1;
  const { messages: wsMessages, sendMessage, status: wsStatus } =
    useRoomWebSocket(useWs ? safeRoom : null);
  const lastWsIndexRef = useRef(-1);
  /** 本機回合還原完成後才允許 persist，避免先清空再還原 */
  const [turnSessionHydrated, setTurnSessionHydrated] = useState(false);

  useEffect(() => {
    setTurnSessionHydrated(false);
  }, [safeRoom, myRank]);
  const latestRecordByPlayerRef = useRef({});
  /** 非自己回合：由 WS 擲骰訊息還原的畫面（唯讀） */
  const [remoteObserverDice, setRemoteObserverDice] = useState(null); // { dice, fromRank }
  /** 非自己回合：對方剛選的 2~12 路線（由 WS text 解析） */
  const [wsRemotePickSums, setWsRemotePickSums] = useState([]);
  /**
   * API 尚未更新時，依 WS「前進」暫時畫出對方盤面：rank -> { sum -> 高度 }
   */
  const [remoteWsBoardByRank, setRemoteWsBoardByRank] = useState({});

  // 廣播約定：name = 當前動作者序號（與 currentPlayerRank 一致）；自己收到自己的訊息不更新 banner
  const broadcastWs = useCallback(
    (text) => {
      if (!useWs || !sendMessage || !text) return;
      const who = Number.isFinite(myRank) ? myRank : currentPlayerRank;
      sendMessage({
        name: String(who),
        text,
        ts: Date.now(),
      });
    },
    [useWs, sendMessage, myRank, currentPlayerRank]
  );

  useEffect(() => {
    if (!useWs) return;
    if (!wsMessages?.length) return;
    const idx = wsMessages.length - 1;
    if (idx <= lastWsIndexRef.current) return;
    lastWsIndexRef.current = idx;

    const msg = wsMessages[idx];
    const sender = parseSenderRank(msg?.name);

    if (Number.isFinite(myRank) && Number.isFinite(sender) && sender === myRank) {
      if (refresh) refresh();
      return;
    }

    const textRaw = msg?.text != null ? String(msg.text).trim() : "";
    if (textRaw !== "") {
      // 旁觀者：對方重新擲骰 → 清高亮 + 清 WS 預覽盤面（新一手）+ 解析唯讀畫面
      if (textRaw.includes("擲骰") || textRaw.includes("繼續擲")) {
        setWsRemotePickSums([]);
        const parsedDice = parseDiceFromRollText(textRaw);
        if (parsedDice && Number.isFinite(sender)) {
          setRemoteObserverDice({ dice: parsedDice, fromRank: sender });
        }
        if (Number.isFinite(sender)) {
          setRemoteWsBoardByRank((prev) => {
            if (!prev[sender]) return prev;
            const next = { ...prev };
            delete next[sender];
            return next;
          });
        }
      }
      if (textRaw.includes("前進")) {
        const { moves, pickSums } = parseForwardMovesFromText(textRaw);
        if (pickSums.length) setWsRemotePickSums(pickSums);
        if (moves.length && Number.isFinite(sender)) {
          setRemoteWsBoardByRank((prev) => {
            const apiMap = listToTrackMap(
              latestRecordByPlayerRef.current[sender]?.list
            );
            const prevLocal = prev[sender] || {};
            const merged = {};
            for (let s = 2; s <= 12; s++) {
              merged[s] = Math.max(apiMap[s] || 0, prevLocal[s] || 0);
            }
            for (const { num, count } of moves) {
              const cap = TRACK_CAP[num];
              if (!cap) continue;
              if (count != null) {
                merged[num] = Math.min(cap, count);
              } else {
                merged[num] = Math.min(cap, (merged[num] || 0) + 1);
              }
            }
            return { ...prev, [sender]: merged };
          });
        }
      }
      if (textRaw.includes("爆掉") || textRaw.includes("已停下存檔")) {
        setWsRemotePickSums([]);
        setRemoteObserverDice(null);
        if (Number.isFinite(sender)) {
          setRemoteWsBoardByRank((prev) => {
            if (!prev[sender]) return prev;
            const next = { ...prev };
            delete next[sender];
            return next;
          });
        }
      }
    }
    if (refresh) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWs, wsMessages, myRank]);

  // 輪到自己時不需要「對方剛選」高亮與對手 WS 預覽
  useEffect(() => {
    if (isMyTurn) {
      setWsRemotePickSums([]);
      setRemoteWsBoardByRank({});
      setRemoteObserverDice(null);
    }
  }, [isMyTurn]);

  // 換人（仍為旁觀）時清掉上一人的擲骰畫面，直到新一則 WS 擲骰
  useEffect(() => {
    if (isMyTurn) return;
    setRemoteObserverDice(null);
  }, [currentPlayerRank, isMyTurn]);

  // 永久存檔：已經確定的高度
  const [savedTracks, setSavedTracks] = useState({}); // { sum: height }
  // 本回合暫存：從 savedTracks 出發加上本回合的進度
  const [turnTracks, setTurnTracks] = useState({}); // { sum: height }
  /** 本回合每次擲骰字串（停下來時才 POST 進 data.dice） */
  const [turnDiceRolls, setTurnDiceRolls] = useState([]);
  // 本回合選擇的路線（最多 3 條）
  const [chosenRoutes, setChosenRoutes] = useState([]); // [sum,...]

  // 骰子與選項
  const [dice, setDice] = useState(null); // [d1,d2,d3,d4]
  const [options, setOptions] = useState([]); // [{id, sums:[s1,s2]}]
  const [phase, setPhase] = useState("idle"); // idle | rolled | deciding | waitingDecision | bust | ended
  const [message, setMessage] = useState("");

  /** 每位玩家「最新一筆」回合紀錄（依 round 最大） */
  const latestRecordByPlayer = useMemo(() => {
    const map = {};
    for (const rec of data?.list || []) {
      const r = recordPlayerRankFromRec(rec);
      if (!Number.isFinite(r)) continue;
      if (!map[r] || rec.round > map[r].round) {
        map[r] = rec;
      }
    }
    return map;
  }, [data?.list]);

  latestRecordByPlayerRef.current = latestRecordByPlayer;

  /** 顯示用：每位玩家在各 sum 上的高度；輪到我時用 turnTracks 覆蓋我的那一筆 */
  const playerHeightMap = useMemo(() => {
    const result = {};
    for (const r of Object.keys(latestRecordByPlayer)) {
      const rankNum = Number(r);
      result[rankNum] = listToTrackMap(latestRecordByPlayer[rankNum].list);
    }
    if (isMyTurn && Number.isFinite(myRank)) {
      const base = result[myRank] || {};
      result[myRank] = { ...base, ...turnTracks };
    }
    return applyTrackCompletionKnockout(result);
  }, [latestRecordByPlayer, isMyTurn, myRank, turnTracks]);

  /** 畫面用：合併 API + 對方 WS「前進」預覽（避免 D1 慢一步時條不動） */
  const displayPlayerHeightMap = useMemo(() => {
    const out = {};
    const ranks = new Set([
      ...Object.keys(playerHeightMap).map(Number),
      ...Object.keys(remoteWsBoardByRank).map(Number),
    ]);
    for (const r of ranks) {
      if (!Number.isFinite(r)) continue;
      const base = { ...(playerHeightMap[r] || {}) };
      const boost = remoteWsBoardByRank[r];
      if (boost) {
        for (let s = 2; s <= 12; s++) {
          const b = boost[s];
          if (b == null) continue;
          const cap = TRACK_CAP[s];
          base[s] = Math.min(
            cap ?? b,
            Math.max(base[s] || 0, b)
          );
        }
      }
      out[r] = base;
    }
    return applyTrackCompletionKnockout(out);
  }, [playerHeightMap, remoteWsBoardByRank]);

  /** 任一人盤面上已封頂 3 條不同路線 → 遊戲結束，該玩家獲勝（取最小座位號） */
  const gameWinnerRank = useMemo(() => {
    const map = displayPlayerHeightMap;
    const ranks = Object.keys(map)
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    for (const rk of ranks) {
      if (countCompletedRoutesForPlayer(map[rk]) >= 3) return rk;
    }
    return null;
  }, [displayPlayerHeightMap]);

  const gameIsOver = gameWinnerRank != null;

  const winMessage = useMemo(() => {
    if (gameWinnerRank == null) return "";
    if (Number.isFinite(myRank) && myRank === gameWinnerRank) {
      return "恭喜！你已先完成 3 條路線獲勝。所有人無法再擲骰或前進。";
    }
    return `遊戲結束：玩家 ${gameWinnerRank} 已先完成 3 條路線獲勝。所有人無法再擲骰或前進。`;
  }, [gameWinnerRank, myRank]);

  useEffect(() => {
    if (gameWinnerRank == null) return;
    setPhase((p) => (p === "ended" ? p : "ended"));
  }, [gameWinnerRank]);

  /**
   * 擲骰紀錄：每筆含該回合 data.currentPlayerRank + 骰點字串。
   * 僅 round0 meta 時用 meta.currentPlayerRank 套全部骰。
   */
  const diceHistoryEntries = useMemo(() => {
    const rounds = [...(data?.list || [])]
      .filter((r) => r && Number(r.round) > 0)
      .sort((a, b) => Number(a.round) - Number(b.round));
    const out = [];
    for (const rec of rounds) {
      const d = parseRecData(rec.data);
      if (!d || !Array.isArray(d.dice)) continue;
      const rank = Number(d.currentPlayerRank);
      const pr = Number.isFinite(rank) && rank >= 1 ? rank : NaN;
      if (d.dice.length === 0) {
        out.push({ rank: pr, roll: "（爆掉·無有效擲骰）" });
      } else {
        for (const x of d.dice) {
          out.push({ rank: pr, roll: String(x) });
        }
      }
    }
    if (out.length > 0) return out.slice().reverse();
    const md = data?.meta?.dice;
    const mr = Number(data?.meta?.currentPlayerRank);
    if (Array.isArray(md)) {
      return md
        .map((x) => ({
          rank: Number.isFinite(mr) && mr >= 1 ? mr : NaN,
          roll: String(x),
        }))
        .reverse();
    }
    return [];
  }, [data?.list, data?.meta]);

  /** 已有玩家封頂的路線（2～12）：新進場不可再選，除非本回合已在該路線上 */
  const sumsWithFinisher = useMemo(() => {
    const set = new Set();
    for (let s = 2; s <= 12; s++) {
      const cap = TRACK_CAP[s];
      if (!cap) continue;
      for (const rk of Object.keys(displayPlayerHeightMap)) {
        const r = Number(rk);
        if (!Number.isFinite(r)) continue;
        if ((displayPlayerHeightMap[r][s] || 0) >= cap) {
          set.add(s);
          break;
        }
      }
    }
    return set;
  }, [displayPlayerHeightMap]);

  // 有人封頂某路線且是「別人」→ 清掉我本回合在該路線的暫存與已選（避免狀態與畫面不一致）
  useEffect(() => {
    if (!isMyTurn || !Number.isFinite(myRank)) return;

    setTurnTracks((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const s of Object.keys(next).map(Number)) {
        const cap = TRACK_CAP[s];
        if (!cap || (next[s] || 0) >= cap) continue;
        const othersClaimed = Object.keys(displayPlayerHeightMap).some(
          (rk) =>
            Number(rk) !== myRank &&
            (displayPlayerHeightMap[Number(rk)][s] || 0) >= cap
        );
        if (othersClaimed) {
          delete next[s];
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    setChosenRoutes((prev) => {
      const filtered = prev.filter((s) => {
        const cap = TRACK_CAP[s];
        if (!cap) return true;
        return !Object.keys(displayPlayerHeightMap).some(
          (rk) =>
            Number(rk) !== myRank &&
            (displayPlayerHeightMap[Number(rk)][s] || 0) >= cap
        );
      });
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [isMyTurn, myRank, displayPlayerHeightMap]);

  // 從 API 同步「我」的存檔高度（僅閒置、未在骰子流程時，避免洗掉本回合暫存）
  useEffect(() => {
    if (!Number.isFinite(myRank)) return;
    const rec = latestRecordByPlayer[myRank];
    if (!rec?.list) return;
    if (phase !== "idle" || dice != null) return;
    setSavedTracks(listToTrackMap(rec.list));
  }, [latestRecordByPlayer, myRank, phase, dice]);

  /** 輪到我：從 localStorage 還原本回合路線／骰子（lastRound + 當前輪序須一致） */
  useEffect(() => {
    if (loading) return;
    if (turnSessionHydrated) return;

    if (!Number.isFinite(myRank) || !isMyTurn) {
      setTurnSessionHydrated(true);
      return;
    }

    try {
      const raw = localStorage.getItem(turnSessionStorageKey(safeRoom, myRank));
      if (raw) {
        const p = JSON.parse(raw);
        if (p.v === TURN_SESSION_V) {
          if (Number(p.lastRound) !== Number(lastRound)) {
            clearTurnSessionStorage(safeRoom, myRank);
          } else if (
            Number(p.currentPlayerRank) !== Number(currentPlayerRank)
          ) {
            clearTurnSessionStorage(safeRoom, myRank);
          } else {
            const hasData =
              (p.turnTracks && Object.keys(p.turnTracks).length > 0) ||
              (p.chosenRoutes && p.chosenRoutes.length > 0) ||
              (p.turnDiceRolls && p.turnDiceRolls.length > 0) ||
              (p.dice && Array.isArray(p.dice) && p.dice.length === 4) ||
              (p.phase &&
                p.phase !== "idle" &&
                p.phase !== "ended" &&
                p.phase !== "bust");

            if (hasData && p.phase !== "bust") {
              setTurnTracks(p.turnTracks || {});
              setChosenRoutes(
                Array.isArray(p.chosenRoutes) ? p.chosenRoutes : []
              );
              setTurnDiceRolls(
                Array.isArray(p.turnDiceRolls) ? p.turnDiceRolls : []
              );
              if (p.phase) setPhase(p.phase);
              if (p.dice && Array.isArray(p.dice) && p.dice.length === 4) {
                setDice(p.dice);
                setOptions(
                  Array.isArray(p.options) && p.options.length > 0
                    ? p.options
                    : buildDiceOptions(p.dice)
                );
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("cannotStop restore turn session", e);
    }
    setTurnSessionHydrated(true);
  }, [
    loading,
    turnSessionHydrated,
    safeRoom,
    myRank,
    lastRound,
    currentPlayerRank,
    isMyTurn,
  ]);

  /** 本機持久化：本回合未存檔進度（僅當前玩家、hydrate 後才寫入） */
  useEffect(() => {
    if (!turnSessionHydrated) return;
    if (!isMyTurn || !Number.isFinite(myRank)) return;

    const hasProgress =
      Object.keys(turnTracks).length > 0 ||
      chosenRoutes.length > 0 ||
      turnDiceRolls.length > 0 ||
      (phase !== "idle" && phase !== "ended" && phase !== "bust") ||
      (dice != null && Array.isArray(dice) && dice.length === 4);

    if (!hasProgress) {
      clearTurnSessionStorage(safeRoom, myRank);
      return;
    }

    try {
      localStorage.setItem(
        turnSessionStorageKey(safeRoom, myRank),
        JSON.stringify({
          v: TURN_SESSION_V,
          lastRound: Number(lastRound) || 0,
          currentPlayerRank,
          turnTracks,
          chosenRoutes,
          turnDiceRolls,
          phase,
          dice,
          options,
        })
      );
    } catch (e) {
      console.warn("cannotStop persist turn session", e);
    }
  }, [
    turnSessionHydrated,
    isMyTurn,
    myRank,
    safeRoom,
    lastRound,
    currentPlayerRank,
    turnTracks,
    chosenRoutes,
    turnDiceRolls,
    phase,
    dice,
    options,
  ]);

  /**
   * 爆掉：送 API — data.dice = 本回合每次擲骰字串 + 最後一筆「x,x,x,x（爆掉）」；list=上一輪存檔
   */
  const submitBustRoundToApi = useCallback(
    async (tracksSnapshot, diceStrings) => {
      const list = trackMapToList(tracksSnapshot);
      const roomId = Number(safeRoom);
      const rankForData = Number.isFinite(myRank) ? myRank : currentPlayerRank;
      const dice =
        Array.isArray(diceStrings) && diceStrings.length > 0
          ? diceStrings.map(String)
          : [];
      const requestBody = {
        room: Number.isFinite(roomId) ? roomId : safeRoom,
        type: null,
        data: {
          currentPlayerRank: rankForData,
          dice,
        },
        list,
        round: Number(lastRound) + 1,
      };
      try {
        const apiUrl = getApiUrl("cloudflare_room_url");
        const requestUrl = `${apiUrl}${safeRoom}`;
        const response = await fetch(requestUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        setPhase("idle");
        setMessage("已記錄爆掉回合（盤面為上一輪存檔），換下一位。");
        if (refresh) await refresh();
        broadcastWs("已提交爆掉回合紀錄");
      } catch (err) {
        console.error("CannotStop bust submit failed:", err);
        setMessage("爆掉紀錄提交失敗，請檢查網路後重新整理再試。");
      }
    },
    [safeRoom, lastRound, myRank, currentPlayerRank, refresh, broadcastWs]
  );

  // 擲 4 顆骰子 + 產生 3 種組合
  const handleRoll = () => {
    // 只能在輪到自己，且「本回合尚未選組合」時才能再擲
    if (!isMyTurn) return;
    if (gameIsOver) return;
    if (phase !== "idle") return;
    if (phase === "ended") return;

    // 新的一回合第一次擲骰：從上一輪存檔的位置開始往上加
    if (dice == null) {
      setTurnTracks(savedTracks);
      setTurnDiceRolls([]);
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
      if (gameIsOver) return;
      const diceForApi = buildBustDicePayload(turnDiceRolls, diceArr);
      setTurnDiceRolls([]);
      // 爆掉：清除本回合紀錄，回到上一輪存檔
      setTurnTracks(savedTracks);
      setChosenRoutes([]);
      setDice(null);
      setOptions([]);
      setPhase("bust");
      setMessage("這次沒有任何合法的前進組合，本回合爆掉，正在提交紀錄…");
      broadcastWs("本回合爆掉（沒有任何可走組合）");
      if (Number.isFinite(myRank))
        clearTurnSessionStorage(safeRoom, myRank);
      void submitBustRoundToApi(savedTracks, diceForApi);
      return;
    }

    setTurnDiceRolls((prev) => [...prev, diceArr.join(",")]);
    setDice(diceArr);
    setOptions(opts);
    setPhase("deciding");
    broadcastWs(`擲骰：${diceArr.join("、")}，請選擇 2～12 路線組合`);
  };

  const canAdvanceSum = (sum) => {
    if (!TRACK_LENGTH[sum]) return false;
    const cap = TRACK_LENGTH[sum];
    const height = turnTracks[sum] || 0;
    // 本路線已到頂：不可再前進（勿只靠 chosenRoutes，否則 7 滿了仍會 true）
    if (height >= cap) return false;
    if (sumsWithFinisher.has(sum) && !chosenRoutes.includes(sum)) return false;
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
    if (gameIsOver) return;
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

    const finishedRoutes = newChosen.filter(
      (s) => nextTurnTracks[s] >= TRACK_LENGTH[s]
    );
    if (finishedRoutes.length >= 3) {
      setPhase("ended");
    }

    broadcastWs(
      `前進｜${validSums
        .map((s) => `和${s}:${nextTurnTracks[s]}`)
        .join("，")}（本回合已選路線最多 3 條）`
    );
  };

  // 停下來：把本回合前進結果丟給 API，並把本地進度存檔
  const handleStop = async () => {
    if (!isMyTurn) return;
    if (phase !== "waitingDecision" && phase !== "ended") return;

    // list：每條路 2~12 的「目前高度」(count)，只送 count > 0 的項
    // 若後端也實作規則：任一玩家某路線 count===該路頂時，應把其他玩家該 num 從 DB 清零（與前端 knockout 一致）
    const list = trackMapToList(turnTracks);

    const roomId = Number(safeRoom);
    const rankForData = Number.isFinite(myRank) ? myRank : currentPlayerRank;
    const requestBody = {
      room: Number.isFinite(roomId) ? roomId : safeRoom,
      type: null,
      data: {
        currentPlayerRank: rankForData,
        dice: [...turnDiceRolls],
      },
      list,
      round: Number(lastRound) + 1, // lastRound 是「上一回合」，此為「本回合」
    };

    try {
      const apiUrl = getApiUrl("cloudflare_room_url");
      // 依現有其他遊戲的格式：POST 只要到 /d1/room/<room>
      // round 放在 requestBody 內
      const requestUrl = `${apiUrl}${safeRoom}`;

      setMessage("正在提交本回合紀錄...");
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const won = countCompletedRoutesForPlayer(turnTracks) >= 3;

      // 本地也同步存檔
      setSavedTracks(turnTracks);
      setTurnTracks({});
      setTurnDiceRolls([]);
      setChosenRoutes([]);
      setDice(null);
      setOptions([]);
      setPhase(won ? "ended" : "idle");
      setMessage(
        won
          ? "已存檔。遊戲已結束。"
          : "已存檔，下次從現在的位置繼續爬。"
      );

      if (Number.isFinite(myRank))
        clearTurnSessionStorage(safeRoom, myRank);

      broadcastWs(
        `已停下存檔｜${list
          .map(({ num, count }) => `和${num} 高度${count}`)
          .join("，") || "（無累積高度）"}`
      );

      // 取回最新資料（round/list/members）
      if (refresh) await refresh();
    } catch (err) {
      console.error("CannotStop stop submit failed:", err);
      setMessage("提交失敗，請再試一次。");
    }
  };

  // 繼續擲：直接立刻擲下一次，不需要再按一次「擲 4 顆骰子」
  const handleContinue = () => {
    if (!isMyTurn) return;
    if (gameIsOver) return;
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
      if (gameIsOver) return;
      const diceForApi = buildBustDicePayload(turnDiceRolls, diceArr);
      setTurnDiceRolls([]);
      setTurnTracks(savedTracks);
      setChosenRoutes([]);
      setDice(null);
      setOptions([]);
      setPhase("bust");
      setMessage("本回合爆掉，正在提交紀錄…");
      broadcastWs("本回合爆掉（沒有任何可走組合）");
      if (Number.isFinite(myRank))
        clearTurnSessionStorage(safeRoom, myRank);
      void submitBustRoundToApi(savedTracks, diceForApi);
      return;
    }

    setTurnDiceRolls((prev) => [...prev, diceArr.join(",")]);
    setDice(diceArr);
    setOptions(opts);
    setPhase("deciding");
    broadcastWs(`繼續擲骰：${diceArr.join("、")}，請選擇路線`);
  };

  return (
    <div className="cannotStop-container">
      <p className="cannotStop-sub cannotStop-sub--header">
        房間: {safeRoom}
        {memberCount > 0 ? ` · ${memberCount} 人` : ""}
        {Number.isFinite(myRank) && myRank >= 1 && (
          <>
            {" · "}
            <span
              className="cannotStop-header-current-swatch"
              style={{ background: loginPlayerColor }}
              title="你的代表色"
              role="img"
              aria-label="你的代表色"
            />
            目標：優先走完 3 條路線玩家獲勝
          </>
        )}
        {useWs && (
          <>
            {" · "}
            即時連線：
            {wsStatus === "open"
              ? "已連線"
              : wsStatus === "connecting"
                ? "連線中…"
                : "未連線"}
          </>
        )}
      </p>
      <p className="cannotStop-sub cannotStop-sync-line" role="status">
        {loading
          ? "房間資料：讀取中…"
          : lastFetchError
            ? `房間資料：更新失敗（${lastFetchError}）`
            : lastFetchOkAt != null
              ? `房間資料：已同步 · ${new Date(lastFetchOkAt).toLocaleString()}`
              : "房間資料：尚未成功載入"}
        {!useWs && !loading && lastFetchOkAt != null && (
          <span className="cannotStop-sync-line__hint">
            {" "}
            · 單人模式，無 WebSocket；請依上方時間確認 API 有更新
          </span>
        )}
        {useWs && !loading && lastFetchOkAt != null && (
          <span className="cannotStop-sync-line__hint">
            {" "}
            · 即時動作另見下方 WS 廣播
          </span>
        )}
      </p>
      {useWs && (
        <div className="cannotStop-ws-log" aria-live="polite">
          <div className="cannotStop-ws-log__title">
            即時廣播（WS）· {wsMessages.length} 則
          </div>
          {wsMessages.length === 0 ? (
            <span className="cannotStop-sub" style={{ marginBottom: 0 }}>
              尚無訊息（擲骰／前進／停存檔後會出現）
            </span>
          ) : (
            <ul className="cannotStop-ws-log__list">
              {[...wsMessages.slice(-25)]
                .reverse()
                .map((m, i) => (
                  <li
                    key={`${m.ts ?? "t"}-${i}-${String(m.text).slice(0, 24)}`}
                  >
                    <span className="cannotStop-ws-log__who">
                      {m.name != null ? String(m.name) : "—"}
                    </span>
                    {m.text != null ? String(m.text) : ""}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      {loading && <p className="cannotStop-sub">載入中…</p>}
      {(gameIsOver || (isMyTurn && message)) && (
        <p className="cannotStop-message">
          {gameIsOver ? winMessage : message}
        </p>
      )}

      <div className="cannotStop-card">
        <p className="cannotStop-hint">
          {gameIsOver
            ? "遊戲已結束。"
            : isMyTurn
              ? "輪到你時按「擲骰子」，每回合只能走三條路線。"
              : "目前不是你的回合。"}
        </p>
        {isMyTurn && !gameIsOver && (
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
        {isMyTurn &&
          gameIsOver &&
          phase === "ended" &&
          Object.keys(turnTracks).length > 0 && (
            <button
              type="button"
              onClick={handleStop}
              className="cannotStop-btn-danger"
            >
              停下來（存檔並結算）
            </button>
          )}
      </div>

      {/* 顯示本次骰子與 3 種選擇（本人可操作；旁觀僅顯示 WS 擲骰還原畫面） */}
      {!gameIsOver &&
        ((isMyTurn && dice) || (!isMyTurn && remoteObserverDice?.dice)) && (
        <div className="cannotStop-card">
          <div className="cannotStop-dice-label">
            本次骰子：
            {(isMyTurn ? dice : remoteObserverDice.dice).join(" , ")}
          </div>
          <div
            className={
              "cannotStop-options" +
              (!isMyTurn ? " cannotStop-options--readonly" : "")
            }
          >
            {(isMyTurn ? options : buildDiceOptions(remoteObserverDice.dice)).map(
              (opt) => {
                const [p1a, p1b] = opt.pairs[0];
                const [p2a, p2b] = opt.pairs[1];
                const [s1, s2] = opt.sums;
                const d = isMyTurn ? dice : remoteObserverDice.dice;
                const can1 = canAdvanceSum(s1);
                const can2 = canAdvanceSum(s2);
                const canBoth = can1 && can2 && canAdvanceCombo(s1, s2);

                if (!isMyTurn) {
                  return (
                    <div
                      key={opt.id}
                      className="cannotStop-option-readonly"
                    >
                      組合 {opt.id + 1}：骰{p1a}({d[p1a - 1]}) + 骰{p1b}(
                      {d[p1b - 1]}) = {s1} ／ 骰{p2a}({d[p2a - 1]}) + 骰{p2b}(
                      {d[p2b - 1]}) = {s2}
                    </div>
                  );
                }

                const buttons = [];

                if (canBoth) {
                  buttons.push(
                    <button
                      key={`${opt.id}-both`}
                      type="button"
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
                        type="button"
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
                        type="button"
                        onClick={() => handleChooseMove([s2])}
                        className="cannotStop-btn-secondary"
                        disabled={!isMyTurn || phase !== "deciding"}
                      >
                        只前進和 {s2}（骰{p2a}+骰{p2b}）
                      </button>
                    );
                  }
                }

                return (
                  <React.Fragment key={opt.id}>{buttons}</React.Fragment>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* 圖例：橘＝僅當前玩家；紫＝僅非當前玩家（多人） */}
      {isMyTurn && !gameIsOver && (
        <p className="cannotStop-sub cannotStop-pending-hint">
          <span
            className="cannotStop-legend-swatch"
            style={{ background: PENDING_ROUTE_COLOR }}
          />{" "}
          橘色：本回合已選路線／尚未存檔（標籤與列底色）。色條左淡＝已存檔、右飽和＝本回合新增。
          刻度格數＝已走格數。
        </p>
      )}
      {!isMyTurn && memberCount > 1 && !gameIsOver && (
        <p className="cannotStop-sub cannotStop-pending-hint">
          <span
            className="cannotStop-legend-swatch"
            style={{ background: REMOTE_PICK_ROUTE_COLOR }}
          />{" "}
          紫色：對手剛選的路線列高亮；進度條上 WS 預覽多出的格為紫＋玩家色漸層。
        </p>
      )}
      <div className="cannotStop-card cannotStop-card-scroll">
        {trackConfig.map((t) => {
          const isPendingChosenRoute =
            isMyTurn &&
            chosenRoutes.includes(t.sum) &&
            phase !== "ended" &&
            phase !== "bust";

          const isRemotePickedRoute =
            !isMyTurn &&
            wsRemotePickSums.length > 0 &&
            wsRemotePickSums.includes(t.sum);

          const ranksWithHeight = Object.keys(displayPlayerHeightMap)
            .map(Number)
            .filter((r) => (displayPlayerHeightMap[r][t.sum] || 0) > 0)
            .sort((a, b) => a - b);

          const ranksToShow = [...ranksWithHeight];
          if (
            isPendingChosenRoute &&
            Number.isFinite(myRank) &&
            !ranksToShow.includes(myRank)
          ) {
            ranksToShow.push(myRank);
            ranksToShow.sort((a, b) => a - b);
          }

          const rowClass =
            "cannotStop-track-row" +
            (isPendingChosenRoute ? " cannotStop-track-row--pending-chosen" : "") +
            (isRemotePickedRoute ? " cannotStop-track-row--remote-pick" : "");

          return (
            <div key={t.sum} className={rowClass}>
              <div className="cannotStop-track-header">
                <span className="cannotStop-track-sum-label">
                  和 {t.sum}
                  {isPendingChosenRoute && (
                    <span className="cannotStop-pending-badge">本回合·未存檔</span>
                  )}
                  {isRemotePickedRoute && (
                    <span className="cannotStop-remote-pick-badge">
                      對手剛選
                    </span>
                  )}
                </span>
                <span className="cannotStop-track-players">
                  {ranksToShow.length === 0 ? (
                    <span className="cannotStop-track-empty">—</span>
                  ) : (
                    ranksToShow.map((r) => {
                      const c = displayPlayerHeightMap[r][t.sum] || 0;
                      const baseColor =
                        PLAYER_COLORS[(r - 1) % PLAYER_COLORS.length];
                      const labelPending =
                        isMyTurn &&
                        r === myRank &&
                        isPendingChosenRoute &&
                        c === 0;
                      return (
                        <span
                          key={r}
                          className={
                            "cannotStop-track-player-label" +
                            (labelPending
                              ? " cannotStop-track-player-label--pending"
                              : "")
                          }
                          style={{
                            color: labelPending
                              ? PENDING_ROUTE_COLOR
                              : baseColor,
                          }}
                        >
                        </span>
                      );
                    })
                  )}
                </span>
              </div>
              <div className="cannotStop-track-bar-wrap">
                <div className="cannotStop-track-bar-fills">
                  {ranksToShow.map((r) => {
                    const rawC = displayPlayerHeightMap[r][t.sum] || 0;
                    const c = Math.min(Math.max(0, rawC), t.length);
                    const base = PLAYER_COLORS[(r - 1) % PLAYER_COLORS.length];
                    const savedC =
                      r === myRank
                        ? Math.min(
                          Math.max(0, savedTracks[t.sum] || 0),
                          t.length
                        )
                        : c;
                    const unsavedC =
                      isMyTurn && r === myRank
                        ? Math.max(0, c - savedC)
                        : 0;
                    const showSplit =
                      isMyTurn &&
                      r === myRank &&
                      unsavedC > 0 &&
                      c > 0;

                    return (
                      <div
                        key={r}
                        className="cannotStop-track-bar-segment-row"
                        style={{
                          gridTemplateColumns: `repeat(${t.length}, 1fr)`,
                        }}
                      >
                        {Array.from({ length: t.length }, (_, i) => {
                          if (i >= c) {
                            return (
                              <div
                                key={i}
                                className="cannotStop-track-bar-seg cannotStop-track-bar-seg--empty"
                              />
                            );
                          }
                          const apiH = Math.min(
                            t.length,
                            playerHeightMap[r]?.[t.sum] ?? 0
                          );
                          let bg;
                          if (showSplit && i < savedC) {
                            bg = withAlpha(base, 0.45);
                          } else if (showSplit) {
                            bg = base;
                          } else if (
                            !isMyTurn &&
                            c > apiH &&
                            i >= apiH &&
                            i < c
                          ) {
                            bg = `linear-gradient(180deg, ${withAlpha(
                              REMOTE_PICK_ROUTE_COLOR,
                              0.5
                            )} 0%, ${base} 78%)`;
                          } else {
                            bg = base;
                          }
                          return (
                            <div
                              key={i}
                              className="cannotStop-track-bar-seg"
                              style={{ background: bg }}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                {/* 每格一等份刻度：共 t.length 格，對齊進度條寬度 */}
                <div
                  className="cannotStop-track-scale-overlay"
                  style={{
                    gridTemplateColumns: `repeat(${t.length}, 1fr)`,
                  }}
                  aria-hidden
                >
                  {Array.from({ length: t.length }, (_, i) => (
                    <div
                      key={i}
                      className="cannotStop-track-scale-cell"
                      title={`第 ${i + 1} 格`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <DiceHistoryList entries={diceHistoryEntries} />

      <button onClick={() => navigate("/")} className="cannotStop-btn">
        回首頁
      </button>
    </div>
  );
}
