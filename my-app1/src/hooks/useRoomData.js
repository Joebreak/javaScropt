import { useEffect, useState, useCallback } from "react";
import { getApiUrl } from "../config/api";

export function useRoomData(intervalMs = 0, room) {
  // 檢查 room 參數是否提供
  if (!room) {
    throw new Error('useRoomData: room 參數是必須的');
  }
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk"

  const fetchData = useCallback(async () => {
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
      const todayStr = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace(/\//g, '');
      if (room === todayStr + '2') {
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
      } else if (room === todayStr + '1') {
        apiUrl = getApiUrl('cloudflare_list_url');

        const res = await fetch(apiUrl, requestOptions);
        clearTimeout(timeoutId);
  
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
  
        const firstData = json.data?.[0];
        setData({ list: firstData?.list ?? [] });
      } else {
        throw new Error('room 參數錯誤', room);
      }
     
    } catch (err) {
      console.error("API 失敗：", err);
    } finally {
      setLoading(false);
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