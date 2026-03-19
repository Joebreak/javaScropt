import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

/**
 * 依 room 抓房間資料，members 來自 round 0 的 data.note2
 */
export function useRoomData(intervalMs = 0, room) {
  if (!room) {
    throw new Error("useRoomData: room 參數是必須的");
  }
  const [data, setData] = useState({ list: [], members: null });
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

      const filteredList = Array.isArray(json)
        ? json
            .filter((item) => item && item.round !== 0)
            .map((item) => ({ id: item.id, round: item.round, ...item.data }))
            .reverse()
        : [];
      const roundZeroData = Array.isArray(json)
        ? json.filter((item) => item && item.list && item.round === 0)[0] || null
        : null;
      const members = roundZeroData?.data?.note2 ?? null;

      setData({ list: filteredList, members });
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
