import { useEffect, useState } from "react";

export function useRoomData(intervalMs = 0) {
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk"

  const fetchData = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(
        "https://voter.dev.box70000.com/api/admin/voter/visitRecord/2",
        {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );
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
    } catch (err) {
      console.error("API 失敗：", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    // 立即執行一次
    fetchData();

    // 根據傳入的間隔時間設定定時器
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
  }, [intervalMs]);

  return { data, loading, refresh: fetchData };
}