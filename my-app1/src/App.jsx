import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [room, setRoom] = useState("");
  const [num, setNum] = useState("");
  const navigate = useNavigate();

  const goToRoom = (room, num) => {
    navigate("/room", {
      state: { room, num }
    });
  };
  const handleLogin = async () => {
    if (!room.trim() || !num.trim()) {
      alert("請輸入房間號碼和順位編號");
      return;
    }

    try {
      const resA = await fetch("https://apis.neweggbox.com/meta/api/v5/file/get_description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "neweggbox-sso-token": "001001de8ec4de22244d599cbeeb2dce0490aa"
        },
        body: JSON.stringify({
          path: 'ghost/share/note.txt',
        }),
      });
      if (!resA.ok) {
        goToRoom(room);
        return
      }
      const data = await resA.json();
      const body = JSON.parse(data.description);
      const matchedData = Array.isArray(body) ? body.find(item => item.room === room.trim()) : null;
      if (!matchedData) {
        goToRoom(room, num);
        return;
      }
      if (matchedData && matchedData.type === "mina") {
        navigate("/mina", { state: { data: matchedData, room, num }, });
        return
      }
      goToRoom(room, num);
    } catch (error) {
      console.error("呼叫 API 失敗：", error);
      goToRoom(room, num);
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
          輸入房間號碼與順位編號
        </h2>
        <input
          type="text"
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
        <input
          type="text"
          placeholder="順位編號"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginBottom: "24px",
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
