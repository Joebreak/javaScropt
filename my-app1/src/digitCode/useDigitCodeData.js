import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

export function useDigitCodeData(intervalMs = 0, room, enabled = false) {
  if (!room) {
    throw new Error('useDigitCodeData: room 參數是必須的');
  }
  
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const requestOptions = {
        method: "GET",
        headers: {},
        signal: controller.signal,
      };
      
      // 使用 digitcode 專用的 API 端點
      const apiUrl = getApiUrl('cloudflare_room_url');
      const res = await fetch(apiUrl + room, requestOptions);
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // 處理 DigitCode 專用的資料格式
      const filteredList = Array.isArray(json)
      ? json
        .filter(item => item && item.round !== 0)
        .map(item => ({ id: item.id, round: item.round, ...item.data }))
        .reverse()
      : [];

      // 獲取遊戲設定資料 (round 0)
      const roundZeroData = Array.isArray(json)
        ? json
          .filter(item => item && item.round === 0)[0] || null
        : null;

      setData({
        list: filteredList,
        mapData: roundZeroData?.list || [],
        members: roundZeroData?.data?.NOTE2 || null
      });

    } catch (err) {
      console.error("DigitCode API 失敗：", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [room]);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    fetchData();

    if (intervalMs > 0 && enabled) {
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
  }, [intervalMs, enabled, fetchData]);

  return { data, loading, refresh: fetchData };
}
