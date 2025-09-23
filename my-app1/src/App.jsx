import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "./config/api";

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
    return { valid: true };
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
    // 呼叫 all_room 取得 type 再決定導向
    try {
      const apiUrl = getApiUrl('cloudflare_all_room_url');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(apiUrl, { method: 'GET', signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rooms = await res.json();
      if (!Array.isArray(rooms) || rooms.length === 0) {
        alert('還沒建立房間');
        return;
      }
      const found = Array.isArray(rooms)
        ? rooms.find((item) => String(item?.room) === String(room))
        : null;
      if (!found) {
        alert('還沒建立房間');
        return;
      }
      const type = String(found?.type || '').trim();
      if (!type) {
        alert('還沒建立房間');
        return;
      }
      navigate(`/${type}` , { state: { room, rank } });
    } catch (error) {
      console.error('取得房間清單失敗：', error);
      alert('取得房間清單失敗，請稍後再試');
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
