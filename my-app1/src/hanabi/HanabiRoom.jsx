import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDigitCodeData } from "./useHanabiData";
import HanabiGrid from "./HanabiGrid";
import HanabiList from "./HanabiList";
import HintSystem from "./HintSystem";
import PlayCardSystem from "./PlayCardSystem";
import "./HanabiRoom.css";

export default function HanabiRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, rank } = location.state || {};
  const [showTooltip, setShowTooltip] = useState(false);
  const [showHintSystem, setShowHintSystem] = useState(false);
  const [showPlayCardSystem, setShowPlayCardSystem] = useState(false);

  const {
    data,
    loading,
    refresh
  } = useDigitCodeData(30000, room, rank);

  // 從 DigitCodeRoom 添加的邏輯
  const lastRound = data?.list?.length ? data.list[0]?.round : 0;
  const remainder = data?.gameState?.players?.length || 4;
  const showActionButtons = rank && lastRound !== undefined && Number(rank) === ((Number(lastRound) % remainder) + 1);

  useEffect(() => {
    if (room) {
      document.title = `花火遊戲 (房間號碼 ${room})`;
    }
  }, [room]);

  // 提示處理函數
  const handleHintGiven = (hintData) => {
    // 如果 API 成功，需要刷新資料
    if (hintData.needsRefresh) {
      refresh();
    }

    // 關閉提示系統
    setShowHintSystem(false);
  };

  const handleHintButtonClick = (type) => {
    setShowHintSystem(true);
  };

  // 出牌處理函數
  const handleCardPlayed = (cardData) => {
    console.log('出牌資料:', cardData);

    // 如果 API 成功，需要刷新資料
    if (cardData.needsRefresh) {
      refresh();
    }

    // 關閉出牌系統
    setShowPlayCardSystem(false);
  };

  const handlePlayCardButtonClick = () => {
    setShowPlayCardSystem(true);
  };
  // 載入中狀態
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f0f0"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px" }}>⏳ 載入遊戲資料中...</div>
          <div style={{ fontSize: "14px", color: "#666" }}>房間號碼: {room}</div>
        </div>
      </div>
    );
  }

  // 如果沒有資料，顯示錯誤
  if (!data) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f0f0"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", marginBottom: "10px", color: "#d32f2f" }}>
            ❌ 無法載入遊戲資料
          </div>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 20px",
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
      </div>
    );
  }

  const {
    players = [],
    discardPile = [],
    fireworks = [],
    currentPlayerIndex = 0,
    lives = 3,
    hints = 8,
    gameLogic = {}
  } = data.gameState || {};

  // 簡單的替代函數
  const getCurrentPlayer = () => {
    if (!players || !Array.isArray(players) || currentPlayerIndex === -1) {
      return null;
    }
    return players[currentPlayerIndex] || null;
  };

  const checkGameEnded = () => {
    return currentPlayerIndex === -1;
  };

  const isLastRoundTriggerPlayer = (playerIndex) => {
    return false; // 簡化版本，總是返回 false
  };

  return (
    <div style={{ padding: 20, background: "#f0f0f0", minHeight: "100vh", position: "relative" }}>
      <div
        className="help-icon"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        ?
        {showTooltip && (
          <div className="tooltip">
            粗框為已知顏色，虛線為未知顏色<br />
            白色字體是已知數字，黑色字體是未知數字
          </div>
        )}
      </div>

      {/* 遊戲狀態顯示 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px',
        padding: '15px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          <span>❤️</span>
          <span style={{ color: lives > 1 ? '#4CAF50' : '#f44336' }}>
            生命值: {lives}
          </span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          <span>💡</span>
          <span style={{ color: hints > 0 ? '#2196F3' : '#ff9800' }}>
            提示次數: {hints}
          </span>
        </div>
      </div>

      {/* 上方：遊戲網格區域 */}
      <HanabiGrid
        players={players}
        discardPile={discardPile}
        fireworks={fireworks}
        currentPlayerIndex={currentPlayerIndex}
        getCurrentPlayer={getCurrentPlayer}
        checkGameEnded={checkGameEnded}
        isLastRoundTriggerPlayer={isLastRoundTriggerPlayer}
        hasObserver={(() => {
          const hasObserver = rank && data?.gameState?.players?.length && rank > data.gameState.players.length;
          return hasObserver;
        })()}
        currentPlayerRank={parseInt(rank)}
        gameLogic={gameLogic}
      />

      {/* 中間：遊戲操作按鈕區域 - 只有輪到該玩家時才顯示 */}
      {showActionButtons && (
        <div style={{
          textAlign: "center",
          padding: "20px 0",
          background: "#fff",
          margin: "20px 0",
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
            {/* 花火遊戲操作按鈕 */}
            <button
              onClick={handlePlayCardButtonClick}
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
              🎴 出牌
            </button>

            <button
              onClick={() => handleHintButtonClick('color')}
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
              提示🎨顏色 or 🔢數字
            </button>
          </div>
        </div>
      )}

      {/* 重新整理按鈕 */}
      <div style={{ textAlign: "center", padding: "10px 0" }}>
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
            transition: "all 0.3s ease",
            marginRight: "10px"
          }}
        >
          🔄 重新整理
        </button>
      </div>

      {/* 下方：遊戲記錄表格 */}
      <HanabiList
        data={data}
      />

      <button
        onClick={() => navigate("/")}
        style={{
          display: "block",
          margin: "20px auto",
          padding: "10px 32px",
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

      {/* 提示系統彈窗 */}
      {showHintSystem && (
        <HintSystem
          players={players}
          currentPlayerRank={parseInt(rank)}
          onHintGiven={handleHintGiven}
          onClose={() => {
            setShowHintSystem(false);
          }}
          room={room}
          currentRound={lastRound}
        />
      )}

      {/* 出牌系統彈窗 */}
      {showPlayCardSystem && (
        <PlayCardSystem
          players={players}
          currentPlayerRank={parseInt(rank)}
          onCardPlayed={handleCardPlayed}
          onClose={() => {
            setShowPlayCardSystem(false);
          }}
          room={room}
          currentRound={lastRound}
          gameLog={data?.list || []}
          mapData={data?.mapData || []}
          fireworks={fireworks}
          gameLogic={gameLogic}
        />
      )}
    </div>
  );
}