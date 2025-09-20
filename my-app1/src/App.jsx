import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [room, setRoom] = useState("");
  const [rank, setRank] = useState("1");
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

  const validateRoom = (room) => {
    if (room.length !== 5) {
      return { valid: false, error: '房間號碼錯誤' };
    }
    if (room === "999") {
      return { valid: true, type: "hanabi" };
    }
    return { valid: true, type: "mina" };
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
      navigate("/hanabi", { state: { room, rank } });
    } else {
      navigate("/mina", { state: { room, rank } });
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
          遊戲登入
        </h2>

        <input
          type="number"
          placeholder="房間號碼 (5位數)"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={inputStyle}
        />
        <select
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          style={inputStyle}
        >
          <option value="1">順位 1</option>
          <option value="2">順位 2</option>
          <option value="3">順位 3</option>
          <option value="4">順位 4</option>
          <option value="5">順位 5</option>
          <option value="6">順位 6</option>
        </select>

        <button
          onClick={handleLogin}
          style={buttonPrimaryStyle}
        >
          開始遊戲
        </button>
      </div>
    </div>
  );
}

export default App;
