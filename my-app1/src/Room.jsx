import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Room() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roomName = searchParams.get("name");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "#e8f5e9"
    }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
        你進入的房間號碼是：{roomName}
      </h1>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "10px 24px",
          fontSize: "16px",
          background: "#ff7043",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        返回首頁
      </button>
    </div>
  );
}

export default Room;
