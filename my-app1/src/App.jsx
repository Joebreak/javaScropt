import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [room, setRoom] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const navigate = useNavigate();
  
  // 房間號碼格式驗證
  const validateRoom = (room) => {
    // 特殊房間號碼 999 (hanabi)
    if (room === "999") {
      return { valid: true, type: "hanabi" };
    }
    if (room.length !== 5) {
      return { valid: false, error: '房間號碼錯誤' };
    }
    // 檢查前 4 碼是否為當天日期
    const todayStr = new Date().toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace(/\//g, '');
    const roomDate = room.substring(0, 4);
    if (roomDate !== todayStr) {
      return { valid: false, error: '房間號碼錯誤' };
    }
      return { valid: true, type: "mina" };
  };

  const handleLogin = async () => {
    if (!room.trim()) {
      alert("請輸入房間號碼");
      return;
    }
    
    // 驗證房間號碼格式
    const roomValidation = validateRoom(room.trim());
    if (!roomValidation.valid) {
      alert(roomValidation.error);
      return;
    }
    
    if (roomValidation.type === "hanabi") {
      if (!showNameInput) {
        setShowNameInput(true);
        return;
      }
      if (!playerName.trim()) {
        alert("請輸入玩家名稱");
        return;
      }
      navigate("/hanabi", { state: { room, playerName } });
    } else {
      navigate("/mina", { state: { room } });
    }
  };
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f7f7f7",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "32px 24px",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "#1976d2", marginBottom: "24px" }}>
          {showNameInput ? "輸入玩家名稱" : "輸入房間號碼"}
        </h2>
        
        {!showNameInput ? (
          <input
            type="number"
            placeholder="房間號碼"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              marginBottom: "16px",
              width: "220px",
            }}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ marginBottom: "12px", color: "#666", fontSize: "14px" }}>
              房間號碼: {room}
            </div>
            <input
              type="text"
              placeholder="玩家名稱"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                marginBottom: "16px",
                width: "220px",
              }}
            />
            <button
              onClick={() => setShowNameInput(false)}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                background: "#666",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginBottom: "8px",
              }}
            >
              返回
            </button>
          </div>
        )}
        
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 32px",
            fontSize: "16px",
            background: "#4f8cff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          {showNameInput ? "開始遊戲" : "登入"}
        </button>
      </div>
    </div>
  );
}

export default App;
