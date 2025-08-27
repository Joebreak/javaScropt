import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoomGrid from "./RoomGrid";
import RoomList from "./RoomList";
import { useRoomData } from "../hooks/useRoomData";

export default function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {};
  const { data, loading } = useRoomData();

  if (!room) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ padding: 0, background: "#f7f7f7" }}>
      <RoomGrid />
      <h2 style={{ textAlign: "center" }}>mina (房間號碼 {room})</h2>
      {loading ? <div style={{ textAlign: "center" }}>⏳ 載入中...</div> : <RoomList data={data} />}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "block",
          margin: "0 auto",
          padding: "0px 32px",
          fontSize: 16,
          background: "#ff7043",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        返回首頁
      </button>
    </div>
  );
}
