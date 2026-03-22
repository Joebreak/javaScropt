import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

function parseRoundRecordData(raw) {
  if (raw == null) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

/**
 * 依 room 抓房間資料
 * - round === 0：遊戲基本資料（members ← data.note2；另可有 currentPlayerRank、dice[]）
 * - round !== 0：每回合紀錄，頂層含 data（玩家序號）、list（{ num, count }[]）
 * - data 可能是 JSON 字串，會嘗試 parse
 */
export function useRoomData(intervalMs = 0, room) {
  if (!room) {
    throw new Error("useRoomData: room 參數是必須的");
  }
  const [data, setData] = useState({
    list: [],
    members: null,
    meta: null,
  });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const apiUrl = getApiUrl("cloudflare_room_url");
      const res = await fetch(apiUrl + room, {
        method: "GET",
        headers: {},
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const roundZero =
        Array.isArray(json)
          ? json.find((item) => item && Number(item.round) === 0) || null
          : null;

      const rawZeroData = roundZero?.data;
      const metaParsed =
        typeof rawZeroData === "string"
          ? (() => {
              try {
                return JSON.parse(rawZeroData);
              } catch {
                return null;
              }
            })()
          : rawZeroData ?? null;

      // Mine 房用 note6；Cannot Stop 文件寫 note2。後端若只填一種 → memberCount=0 → useWs 不開 → 看不到 WS
      const n2 = Number(metaParsed?.note2);
      const n6 = Number(metaParsed?.note6);
      const members = Number.isFinite(n2) && n2 >= 1
        ? n2
        : Number.isFinite(n6) && n6 >= 1
          ? n6
          : null;
      const meta = metaParsed;

      const roundRecords = Array.isArray(json)
        ? json
            .filter(
              (item) =>
                item &&
                item.round != null &&
                Number(item.round) !== 0
            )
            .map((item) => ({
              id: item.id,
              room: item.room,
              type: item.type ?? null,
              round: Number(item.round),
              /** 玩家序號 + 骰子紀錄；可能是 JSON 字串 */
              data: parseRoundRecordData(item.data),
              list: Array.isArray(item.list) ? item.list : [],
            }))
            .sort((a, b) => b.round - a.round)
        : [];

      setData({
        list: roundRecords,
        members,
        meta,
      });
    } catch (err) {
      console.error("API 失敗：", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [room]);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;
    fetchData();
    if (intervalMs > 0) {
      intervalId = setInterval(() => {
        if (mounted) fetchData();
      }, intervalMs);
    }
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalMs, fetchData]);

  return { data, loading, refresh: fetchData };
}
