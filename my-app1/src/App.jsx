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
      alert("請輸入房間號碼和數字");
      return;
    }

    try {
      const url = "https://vlntr-api.dev.box70000.com";
      // 1️⃣ 呼叫 API
      const resA = await fetch(url + "/vlntr/api/backend/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: 'joe',
          password: 'joe',
        }),
      });
      if (!resA.ok) {
        goToRoom(room, null);
        return
      }
      const raw = resA.headers.get("Set-Cookie");
      const token = raw?.split(";")[0]?.trim() ?? null;

      const resB = await fetch(url + "/vlntr/api/backend/vlntr_member/list/A26?year=2025", {
        method: "GET",
        headers: { "Cookie": token }
      });
      // 2️⃣ 解析回傳
      const data = await resB.json();
      console.log(data.data.group1Name);

      // 3️⃣ 成功才跳轉，並把 API 資料帶過去
      navigate("/room", {
        state: {
          room: room.trim(),
          num: num.trim(),
          apiResult: data, // 這裡也可以帶後端回應
        },
      });
    } catch (error) {
      console.error("呼叫 API 失敗：", error);
      goToRoom(room, null);
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
          輸入房間號碼與數字
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
          placeholder="數字"
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
