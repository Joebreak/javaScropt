import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoomGrid from "./RoomGrid";
import RoomList from "./RoomList";
import { useRoomData } from "../hooks/useRoomData";

export default function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};

  // 數據獲取
  const { data, loading, refresh } = useRoomData(0, room);
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const remainder = data?.members ? Number(data.members) : 4;
  const showActionButtons = rank && lastRound !== undefined && Number(rank) === ((Number(lastRound) % remainder) + 1);

  // 圖形控制狀態
  const [showShapeButtons, setShowShapeButtons] = useState(false);
  const [showRotateButtons, setShowRotateButtons] = useState(true);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showRadiateSelector, setShowRadiateSelector] = useState(false);
  const deleteRef = useRef(null);

  // 處理函數
  const handleRadiate = () => {
    setShowRadiateSelector(true);
  };

  const handleSpecifyPosition = () => {
    setShowPositionSelector(true);
  };

  const handlePositionConfirm = () => {
    if (refresh) {
      refresh();
    }
    setShowPositionSelector(false);
  };

  const handleRadiateConfirm = () => {
    if (refresh) {
      refresh();
    }
    setShowRadiateSelector(false);
  };

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
      <RoomGrid 
        showActionButtons={!!showActionButtons} 
        gameData={{ room, lastRound, mapData: data?.mapData }} 
        onRefresh={refresh}
        showShapeButtons={showShapeButtons}
        setShowShapeButtons={setShowShapeButtons}
        showRotateButtons={showRotateButtons}
        setShowRotateButtons={setShowRotateButtons}
        showPositionSelector={showPositionSelector}
        setShowPositionSelector={setShowPositionSelector}
        showRadiateSelector={showRadiateSelector}
        setShowRadiateSelector={setShowRadiateSelector}
        onPositionConfirm={handlePositionConfirm}
        onRadiateConfirm={handleRadiateConfirm}
        deleteRef={deleteRef}
      />

      {/* 第一排按鈕：🔄 重新整理、顯示圖形、放射超音波、查詢指定位置 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px 0",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        {/* 重新整理按鈕 */}
        <button
          onClick={refresh}
          style={{
            padding: "8px 16px",
            background: "#4f8cff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease"
          }}
        >
          🔄 
        </button>

        {/* 顯示圖形按鈕 */}
        <button
          onClick={() => setShowShapeButtons(!showShapeButtons)}
          style={{
            padding: "8px 16px",
            background: showShapeButtons ? "#667eea" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease"
          }}
        >
          {showShapeButtons ? "隱藏圖形" : "顯示圖形"}
        </button>

        {/* 放射超音波按鈕 */}
        {showActionButtons && (
          <button
            onClick={handleRadiate}
            style={{
              padding: "8px 16px",
              background: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease"
            }}
          >
            放射超音波
          </button>
        )}

        {/* 查詢指定位置按鈕 */}
        {showActionButtons && (
          <button
            onClick={handleSpecifyPosition}
            style={{
              padding: "8px 16px",
              background: "#7952b3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              transition: "all 0.3s ease"
            }}
          >
            查詢指定位置
          </button>
        )}
      </div>

      {/* 第二排按鈕：X 隱藏選轉、顯示選轉 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "10px 0 20px 0",
        gap: "10px",
        flexWrap: "wrap"
      }}>
        <div
          ref={deleteRef}
          className="delete-area"
        >X</div>

        <button
          onClick={() => setShowRotateButtons(false)}
          style={{
            padding: "6px 12px",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease"
          }}
        >
          隱藏旋轉
        </button>

        <button
          onClick={() => setShowRotateButtons(true)}
          style={{
            padding: "6px 12px",
            background: "#51cf66",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            transition: "all 0.3s ease"
          }}
        >
          顯示旋轉
        </button>
      </div>


      {/* 列表 */}
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
