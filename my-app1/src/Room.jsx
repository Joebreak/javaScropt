import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Room() {
  const location = useLocation();
  const navigate = useNavigate();

  const { room, num } = location.state || {};

  // 沒有參數就返回首頁
  if (!room || !num) {
    navigate("/");
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#e8f5e9",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        房間號碼：{room}
      </h1>
      <h2>數字參數：{num}</h2>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 24px",
          fontSize: "16px",
          background: "#ff7043",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        返回首頁
      </button>
    </div>
  );
}

export default Room;
