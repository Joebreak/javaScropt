import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoomGrid from "./RoomGrid";
import RoomList from "./RoomList";
import { useRoomData } from "../hooks/useRoomData";

export default function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};

  // 頻率選擇狀態
  const [refreshInterval, setRefreshInterval] = useState(0);
  const { data, loading, refresh } = useRoomData(refreshInterval, room);
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const remainder = data?.members ? Number(data.members) : 4;
  const showActionButtons = rank && lastRound !== undefined && Number(rank) === ((Number(lastRound) % remainder) + 1);

  useEffect(() => {
    if (room) {
      document.title = `mina (房間號碼 ${room})`;
    }
  }, [room]);

  if (!room) {
    navigate("/");
    return null;
  }
  return (
    <div style={{ padding: 0, background: "#f7f7f7" }}>
      <RoomGrid showActionButtons={!!showActionButtons} gameData={{ room, lastRound, mapData: data?.mapData }} onRefresh={refresh} />

      {/* 頻率選擇器 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px 0",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <span style={{
          fontSize: "16px",
          fontWeight: "bold",
          color: "#333",
          marginRight: "10px"
        }}>
          🔄 自動更新頻率:
        </span>

        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            border: "2px solid #4f8cff",
            borderRadius: "6px",
            background: "white",
            color: "#333",
            cursor: "pointer",
            minWidth: "120px"
          }}
        >
          <option value={0}>執行一次</option>
          <option value={5000}>每5秒</option>
          <option value={10000}>每10秒</option>
          <option value={20000}>每20秒</option>
        </select>
      </div>

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
