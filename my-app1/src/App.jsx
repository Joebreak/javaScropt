import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    if (!room.trim()) {
      alert("請輸入房間號碼");
      return;
    }
      navigate("/test", { state: { room }, });
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
          輸入房間號碼
        </h2>
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
          登入
        </button>
      </div>
    </div>
  );
}

export default App;
