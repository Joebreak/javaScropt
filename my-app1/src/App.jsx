import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [room, setRoom] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [mode, setMode] = useState("room"); // room | hanabi | mina-extra
  const [rank, setRank] = useState("");
  const navigate = useNavigate();

  // 共用樣式
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f7f7f7",
  };
  const cardStyle = {
    background: "#fff",
    padding: "32px 24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };
  const inputStyle = {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    marginBottom: "16px",
    width: "220px",
  };
  const buttonPrimaryStyle = {
    padding: "10px 32px",
    fontSize: "16px",
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  };
  const buttonSecondaryStyle = {
    padding: "8px 16px",
    fontSize: "14px",
    background: "#666",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginBottom: "8px",
  };
  const labelStyle = { marginBottom: "12px", color: "#666", fontSize: "14px" };

  const validateRoom = (room) => {
    if (room === "999") {
      return { valid: true, type: "hanabi" };
    }
    if (room.substring(0, 4) !== new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace(/\//g, '')) {
      return { valid: false, error: '房間號碼錯誤' };
    }
    const requiresExtra = room.charAt(4) === '8';
    return { valid: true, type: "mina", requiresExtra };
  };

  const handleLogin = async () => {
    if (!room.trim()) {
      alert("請輸入房間號碼");
      return;
    }
    const roomValidation = validateRoom(room.trim());
    if (!roomValidation.valid) {
      alert(roomValidation.error);
      return;
    }
    if (roomValidation.type === "hanabi") {
      if (mode !== "hanabi") {
        setMode("hanabi");
        return;
      }
      if (!playerName.trim()) {
        alert("請輸入玩家名稱");
        return;
      }
      navigate("/hanabi", { state: { room, playerName } });
    } else {
      if (roomValidation.requiresExtra) {
        if (mode !== "mina-extra") {
          setMode("mina-extra");
          return;
        }
        if (!rank.trim()) {
          alert("請輸入順位");
          return;
        }
        navigate("/mina", { state: { room, rank } });
      } else {
        navigate("/mina", { state: { room } });
      }
    }
  };
  return (
    <div
      style={containerStyle}
    >
      <div
        style={cardStyle}
      >
        <h2 style={{ color: "#1976d2", marginBottom: "24px" }}>
          {mode === "hanabi"
            ? "輸入玩家名稱"
            : mode === "mina-extra"
            ? "輸入 順位"
            : "輸入房間號碼"}
        </h2>

        {mode === "room" ? (
          <input
            type="number"
            placeholder="房間號碼"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={inputStyle}
          />
        ) : mode === "hanabi" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={labelStyle}>
              房間號碼: {room}
            </div>
            <input
              type="text"
              placeholder="玩家名稱"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() => setMode("room")}
              style={buttonSecondaryStyle}
            >
              返回
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={labelStyle}>
              房間號碼: {room}
            </div>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              style={inputStyle}
            >
              <option value="">選擇順位 (1-6)</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
            <button
              onClick={() => setMode("room")}
              style={buttonSecondaryStyle}
            >
              返回
            </button>
          </div>
        )}

        <button
          onClick={handleLogin}
          style={buttonPrimaryStyle}
        >
          {mode === "room" ? "登入" : "開始遊戲"}
        </button>
      </div>
    </div>
  );
}

export default App;
