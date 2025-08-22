import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Room() {
  const location = useLocation();
  const navigate = useNavigate();

  const { room, num } = location.state || {};

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
      <>
        <h1 style={{ fontSize: "28px", marginBottom: "16px", color: "#ff7043" }}>
          空房間(房間號碼：{room})
        </h1>
        <p style={{ fontSize: "18px", color: "#555" }}>
          目前沒有任何資料，請確認房間號碼或稍後再試。
        </p>
      </>
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
