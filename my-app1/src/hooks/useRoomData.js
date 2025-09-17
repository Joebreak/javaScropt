import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

export function useRoomData(intervalMs = 0, room) {
  if (!room) {
    throw new Error('useRoomData: room 參數是必須的');
  }
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false); // 使用 useRef 防止重複請求
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk"

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
      console.log(room.substring(4));
      if (room.substring(4) === '9') {
        apiUrl = getApiUrl('boxUrl');
        requestOptions.headers.authorization = `Bearer ${token}`;

        const res = await fetch(apiUrl, requestOptions);
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        let body = {};
        try {
          body = JSON.parse(json.data.description ?? "{}");
        } catch {
          body = {};
        }

        setData({ list: body?.list ?? [] });
      } else if (room.substring(4) === '8') {
        apiUrl = getApiUrl('cloudflare_room_url');

        const res = await fetch(apiUrl + room.substring(0, 4), requestOptions);
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const allData = Array.isArray(json)
          ? json
              .filter(item => item && item.data)
              .map(item => ({ id: item.id, round: item.round, ...item.data }))
          : [];

        setData({ list: allData });
      } else {
        apiUrl = getApiUrl('cloudflare_list_url');

        const res = await fetch(apiUrl, requestOptions);
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const firstData = json.data?.[0];
        setData({ list: firstData?.list ?? [] });
      }

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