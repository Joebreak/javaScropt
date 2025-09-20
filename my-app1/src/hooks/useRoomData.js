import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

export function useRoomData(intervalMs = 0, room) {
  if (!room) {
    throw new Error('useRoomData: room 參數是必須的');
  }
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false); // 使用 useRef 防止重複請求

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let apiUrl;

      const requestOptions = {
        method: "GET",
        headers: {},
        signal: controller.signal,
      };
      apiUrl = getApiUrl('cloudflare_room_url');

      const res = await fetch(apiUrl + room, requestOptions);
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      const filteredList = Array.isArray(json)
        ? json
          .filter(item => item && item.round !== 0)
          .map(item => ({ id: item.id, round: item.round, ...item.data }))
          .reverse()
        : [];
      const roundZeroData = Array.isArray(json)
        ? json
          .filter(item => item && item.list && item.round === 0)
          .flatMap(item => {
            const list = item.list;
            if (Array.isArray(list)) {
              return list.filter(listItem => listItem.NOTE3 !== null);
            }
            return [list];
          })
        : [];

      // 從原始 json 中取得 type 資訊（在 item 層級，不是 list 層級）
      const typeItem = Array.isArray(json)
        ? json.find(item => item && item.type)
        : null;
      const type = typeItem ? typeItem.type : null;

      setData({
        list: filteredList,
        mapData: roundZeroData,
        members: type
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
        if (mounted) {
          fetchData();
        }
      }, intervalMs);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalMs, fetchData]);

  return { data, loading, refresh: fetchData };
}