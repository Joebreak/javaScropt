import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DigitCodeGrid from "./DigitCodeGrid";
import DigitCodeList from "./DigitCodeList";
import { useDigitCodeData } from "./useDigitCodeData";
import Question2Modal from "./Question2Modal";

export default function DigitCodeRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};

  // 數據獲取
  const { data, loading, refresh } = useDigitCodeData(0, room);
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const remainder = data?.members ? Number(data.members) : 4;
  const showActionButtons = rank && lastRound !== undefined && Number(rank) === ((Number(lastRound) % remainder) + 1);
  
  // 用戶選擇記錄 - 使用 localStorage 持久化
  const [userSelections, setUserSelections] = useState(() => {
    const saved = localStorage.getItem(`digitCode_selections_${room}`);
    return saved ? JSON.parse(saved) : {};
  });

  // 問題2彈跳視窗狀態
  const [showQuestion2Modal, setShowQuestion2Modal] = useState(false);

  // 從 API 數據獲取遊戲狀態
  const gameData = {
    room: room || 'default',
    players: data?.members || 2,
    currentRound: data?.list?.length ? data.list[0]?.round + 1 : 1,
    answerData: data?.mapData || null, // 添加答案數據 (mapData 包含遊戲答案)
  };

  // 處理用戶選擇記錄
  const handleUserSelection = (selections) => {
    setUserSelections(selections);
    // 保存到 localStorage
    localStorage.setItem(`digitCode_selections_${room}`, JSON.stringify(selections));
  };

  // 處理問題2提交
  const handleQuestion2Submit = (questionData) => {
    console.log('問題2提交結果:', questionData);
    
    // 如果標記需要更新畫面，則重新獲取數據
    if (questionData.needsRefresh) {
      refresh();
    }
  };

  useEffect(() => {
    if (room) {
      document.title = `Digit Code (房間號碼 ${room})`;
    }
  }, [room]);

  if (!room) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ padding: 0, background: "#f7f7f7", minHeight: "100vh" }}>
      {/* 數字網格區域 */}
      <DigitCodeGrid
        gameData={gameData}
        userSelections={userSelections}
        onUserSelection={handleUserSelection}
      />

      {/* 重新整理按鈕 */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
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
          🔄 重新整理
        </button>
      </div>

      {/* 遊戲操作按鈕 - 只有輪到該玩家時才顯示 */}
      {showActionButtons && (
        <div style={{ 
          textAlign: "center", 
          padding: "20px 0",
          background: "#fff",
          margin: "0 20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "12px",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            {/* 4個問題按鈕 */}
            <button
              onClick={() => {/* TODO: 處理問題1 */}}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              問題1: 行或列的數字數量
            </button>
            
            <button
              onClick={() => setShowQuestion2Modal(true)}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              問題2: 相鄰數字的大小關係
            </button>
            
            <button
              onClick={() => {/* TODO: 處理問題3 */}}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              問題3: 數字是偶數還是奇數
            </button>
            
            <button
              onClick={() => {/* TODO: 處理問題4 */}}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "#9C27B0",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)",
                transition: "all 0.3s ease"
              }}
            >
              問題4: 特定位置是否有
            </button>
            
            {/* 答題按鈕 */}
            <button
              onClick={() => {/* TODO: 處理答題 */}}
              style={{
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
                transition: "all 0.3s ease",
                marginTop: "10px"
              }}
            >
              🎯 提交答案
            </button>
          </div>
        </div>
      )}

      {/* 遊戲記錄列表 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>⏳ 載入中...</div>
      ) : (
        <DigitCodeList data={data} />
      )}

      {/* 返回首頁按鈕 */}
      <div style={{ textAlign: "center", padding: "20px 0" }}>
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

      {/* 問題2彈跳視窗 */}
      <Question2Modal
        isOpen={showQuestion2Modal}
        onClose={() => setShowQuestion2Modal(false)}
        onSubmit={handleQuestion2Submit}
        gameData={gameData}
      />
    </div>
  );
}
