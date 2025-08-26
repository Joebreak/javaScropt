import { useEffect, useState } from "react";

export function useRoomData() {
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          "https://voter.dev.box70000.com/api/admin/voter/visitRecord/2",
          {
            method: "GET",
            headers: {
              authorization:
                "Bearer yJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk",
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

        if (mounted) setData({ list: body?.list ?? [] });
      } catch (err) {
        console.error("API 失敗：", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading };
}