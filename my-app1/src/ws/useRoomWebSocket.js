import { useEffect, useRef, useState } from "react";
import { getApiUrl } from "../config/api";

/**
 * 共用 WebSocket 房間 hook
 * - roomId: 文字，例 "6666"
 * - 回傳 messages / sendMessage / status / error
 *
 * WebSocket 後端：
 *   ws(s)://<cloudflare_durable_url>/ws?room=<roomId>
 *   傳輸格式：JSON { name, text, ts? }
 */
export function useRoomWebSocket(roomId) {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("connecting"); // connecting | open | closed
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const baseUrl = getApiUrl("cloudflare_durable_url");

  useEffect(() => {
    if (!roomId) return;

    const url = new URL(baseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.searchParams.set("room", roomId);

    const ws = new WebSocket(url.toString());
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => {
      setStatus("open");
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        // 後端格式：{ type, body: '{"name":"...","text":"...","ts":...}', ts }
        let payload = raw;
        if (typeof raw.body === "string") {
          try {
            const inner = JSON.parse(raw.body);
            payload = {
              ...inner,
              ts: inner.ts || raw.ts,
              type: raw.type,
            };
          } catch {
            // body 不是 JSON，就直接當作 text
            payload = {
              name: raw.name || "匿名",
              text: raw.body,
              ts: raw.ts,
              type: raw.type,
            };
          }
        }

        console.log("[WS][room=%s] message parsed:", roomId, payload);
        setMessages((prev) => [...prev, payload]);
      } catch (e) {
        console.error("Invalid WS message", e, event.data);
      }
    };

    ws.onerror = () => {
      setError("WebSocket 連線錯誤");
    };

    ws.onclose = () => {
      setStatus("closed");
    };

    return () => {
      ws.close();
    };
  }, [baseUrl, roomId]);

  const sendMessage = (payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("WebSocket 尚未連線");
      return;
    }
    ws.send(JSON.stringify(payload));
  };

  return {
    messages,
    status,
    error,
    sendMessage,
  };
}

