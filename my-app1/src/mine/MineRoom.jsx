import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RoomGrid from "./RoomGrid";
import RoomList from "./RoomList";
import { useRoomData } from "./useRoomData";
import ShapeValidator from "./grid/ShapeValidator";

export default function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};

  // 數據獲取
  const { data, loading, refresh } = useRoomData(30000, room);
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const remainder = data?.members ? Number(data.members) : 4;
  const showActionButtons = rank && lastRound !== undefined && Number(rank) === ((Number(lastRound) % remainder) + 1);

  // 圖形控制狀態
  const [showShapeButtons, setShowShapeButtons] = useState(false);
  const [showShapeSelector, setShowShapeSelector] = useState(false);
  const [showPositionSelector, setShowPositionSelector] = useState(false);
  const [showRadiateSelector, setShowRadiateSelector] = useState(false);
  const [showShapeValidator, setShowShapeValidator] = useState(false);
  const [roomGridData, setRoomGridData] = useState(null);
  const [showExampleShapes, setShowExampleShapes] = useState(true);

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

  const handleShapeValidation = () => {
    loadRoomGridData(); // 載入最新的網格數據
    setShowShapeValidator(true);
  };

  // 清空網格功能
  const handleClearGrid = () => {
    const emptyGrid = Array(8).fill().map(() => Array(10).fill(null));
    localStorage.setItem(`roomGrid_${room}`, JSON.stringify(emptyGrid));
    // 刷新頁面以更新網格
    if (refresh) {
      refresh();
    }
  };

  const handleShapeValidatorConfirm = () => {
    if (refresh) {
      refresh();
    }
    setShowShapeValidator(false);
  };

  // 從 localStorage 讀取網格數據
  const loadRoomGridData = () => {
    try {
      const key = `roomGrid_${room || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedGrid = JSON.parse(saved);
        setRoomGridData(parsedGrid);
      } else {
        setRoomGridData(null);
      }
    } catch (error) {
      console.error('載入房間網格數據失敗:', error);
      setRoomGridData(null);
    }
  };

  useEffect(() => {
    if (room) {
      document.title = `mine (房間號碼 ${room})`;
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
        showShapeSelector={showShapeSelector}
        setShowShapeSelector={setShowShapeSelector}
        showPositionSelector={showPositionSelector}
        setShowPositionSelector={setShowPositionSelector}
        showRadiateSelector={showRadiateSelector}
        setShowRadiateSelector={setShowRadiateSelector}
        onPositionConfirm={handlePositionConfirm}
        onRadiateConfirm={handleRadiateConfirm}
        showExampleShapes={showExampleShapes}
        setShowExampleShapes={setShowExampleShapes}
        onClearGrid={handleClearGrid}
        list={data?.list || []}
      />

      {/* 第一排按鈕：重新整理 + 顯示圖形 + 隱藏圖形 */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "20px 0 10px 0",
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

        {/* 顯示範例圖形按鈕 */}
        <button
          onClick={() => setShowExampleShapes(!showExampleShapes)}
          style={{
            padding: "8px 16px",
            background: showExampleShapes ? "#6c757d" : "#17a2b8",
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
          {showExampleShapes ? "隱藏範例" : "顯示範例圖形"}
        </button>

        {/* 顯示/隱藏圖形按鈕 */}
        <button
          onClick={() => setShowShapeSelector(!showShapeSelector)}
          style={{
            padding: "8px 16px",
            background: showShapeSelector ? "#6c757d" : "#007bff",
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
          {showShapeSelector ? "隱藏圖形" : "顯示圖形"}
        </button>


      </div>

      {/* 第二排按鈕：放射超音波、查詢指定位置、圖形驗證 */}
      {showActionButtons && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px 0 20px 0",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          {/* 放射超音波按鈕 */}
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

          {/* 查詢指定位置按鈕 */}
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

          {/* 圖形驗證按鈕 */}
          <button
            onClick={handleShapeValidation}
            style={{
              padding: "8px 16px",
              background: "#e74c3c",
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
            圖形驗證
          </button>
        </div>
      )}

      {/* 列表 */}
      {loading ? <div style={{ textAlign: "center" }}>⏳ 載入中...</div> : <RoomList data={data} />}
      
      {/* 返回首頁和清空網格按鈕 */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button
            onClick={handleClearGrid}
            style={{
              padding: "12px 24px",
              fontSize: "16px",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#c82333";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#dc3545";
              e.target.style.transform = "translateY(0)";
            }}
          >
            🗑️ 清空(全部)網格
          </button>
          
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 32px",
              fontSize: "16px",
              background: "#ff7043",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(255, 112, 67, 0.3)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#ff5722";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#ff7043";
              e.target.style.transform = "translateY(0)";
            }}
          >
            返回首頁
          </button>
        </div>
      </div>

      {/* 圖形驗證彈窗 */}
      <ShapeValidator
        isOpen={showShapeValidator}
        onClose={() => setShowShapeValidator(false)}
        onConfirm={handleShapeValidatorConfirm}
        gameData={{ room, lastRound, mapData: data?.mapData }}
        roomGridData={roomGridData}
      />
    </div>
  );
}
