import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRoomWebSocket } from "../ws/useRoomWebSocket";

/**
 * CannotStopRoom — 使用 Durable Object 的房間頁
 *
 * 學習重點：
 * - 狀態存在 DO 內（同一 roomId 永遠同一實例）
 * - GET /room/:roomId/state 讀狀態
 * - POST /room/:roomId/join 寫入（加入成員、計數）
 * - 可擴充：WebSocket 在 DO 內接線，即時廣播
 */
export default function CannotStopRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rank } = location.state || {};

  // 房間號碼固定 6666，所有人進來都在同一個聊天房
  const roomId = "6666";

  const [joinName, setJoinName] = useState(`玩家-${rank || "?"}`);
  const [input, setInput] = useState("");

  const { messages, status, error, sendMessage } = useRoomWebSocket(roomId);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    sendMessage({
      name: joinName || "匿名",
      text,
      ts: Date.now(),
    });
    setInput("");
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>CannotStop 聊天室（WebSocket + Durable Objects）</h2>
      <p style={styles.sub}>
        房間: {roomId} · 狀態: {status}
      </p>

      {error && <p style={{ color: "#c00" }}>{error}</p>}

      <div style={{ ...styles.card, maxHeight: 360, overflowY: "auto" }}>
        {messages.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>還沒有訊息，先打第一句吧。</p>
        ) : (
          messages.map((m) => (
            <div key={m.id || m.ts} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: "bold", marginRight: 6 }}>
                {m.name || "匿名"}
              </span>
              <span style={{ color: "#666", fontSize: 12 }}>
                {m.ts ? new Date(m.ts).toLocaleTimeString() : ""}
              </span>
              <div>{m.text}</div>
            </div>
          ))
        )}
      </div>

      <div style={styles.card}>
        <input
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          placeholder="顯示名稱"
          style={styles.input}
        />
        <div style={{ display: "flex", marginTop: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="輸入聊天內容…"
            style={{ ...styles.input, flex: 1, marginRight: 8, marginBottom: 0 }}
          />
          <button onClick={handleSend} style={styles.btn}>
            送出
          </button>
        </div>
      </div>

      <button onClick={() => navigate("/")} style={styles.btn}>
        回首頁
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    maxWidth: 560,
    margin: "0 auto",
  },
  title: { color: "#1976d2", marginBottom: 4 },
  sub: { fontSize: 12, color: "#666", marginBottom: 16 },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    marginBottom: 16,
  },
  pre: { fontSize: 12, overflow: "auto", margin: 0 },
  input: {
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
    width: 160,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  btn: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#888",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  btnDanger: {
    padding: "8px 16px",
    marginRight: 8,
    marginBottom: 8,
    background: "#c00",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};
