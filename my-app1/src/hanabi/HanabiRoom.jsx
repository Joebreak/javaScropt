import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useHanabiData } from "./useHanabiData";
import { generateCSSVariables, getSafeColorData } from "./gameData";
import HanabiGameInfo from "./HanabiGameInfo";
import "./HanabiRoom.css";

export default function HanabiRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, playerName } = location.state || {};
  const [showTooltip, setShowTooltip] = useState(false);
  
  const { 
    gameState, 
    loading, 
    error, 
    getCurrentPlayer,
    checkGameEnded,
    isLastRoundTriggerPlayer,
  } = useHanabiData(room, playerName);

  useEffect(() => {
    if (room) {
      const title = playerName 
        ? `花火遊戲 - ${playerName} (房間 ${room})`
        : `花火遊戲 (房間號碼 ${room})`;
      document.title = title;
    }

    const style = document.createElement('style');
    style.textContent = generateCSSVariables();
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [room, playerName]);

  if (!room) {
    navigate("/");
    return null;
  }

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

  // 錯誤狀態
  if (error) {
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
            ❌ 載入遊戲資料失敗
          </div>
          <div style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
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
            重新載入
          </button>
        </div>
      </div>
    );
  }

  // 如果沒有遊戲資料，顯示錯誤
  if (!gameState) {
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

  const { players, discardPile, fireworks, currentPlayerIndex } = gameState;
  const currentPlayer = getCurrentPlayer();
  
  // 除錯資訊
  const playerCount = players.length;
  const validCurrentIndex = ((currentPlayerIndex % playerCount) + playerCount) % playerCount;

  // 獲取卡片樣式的函數 - 完全動態，自動處理未知顏色
  const getCardStyle = (color) => {
    const colorData = getSafeColorData(color);
    
    return {
      backgroundColor: colorData.bgColor,
      color: colorData.textColor,
    };
  };

  const renderPlayer = (player, playerIndex) => {
    const isCurrentPlayer = !checkGameEnded() && playerIndex === validCurrentIndex;
    const isLastRoundTrigger = isLastRoundTriggerPlayer(playerIndex);
    const playerClass = `player ${isCurrentPlayer ? 'current-player' : ''}`;
    
    return (
      <div key={player.name} className={playerClass}>
        <strong>{player.name} {isLastRoundTrigger ? '👑' : ''}</strong>
        <div className="hand">
          {player.hand.map((card, index) => {
            let text = "";
            let cls = "card";

            if (player.isSelf) {
              if (card.knownColor) {
                cls += ` ${card.color}`;
              } else {
                cls += " unknown";
              }
              text = card.knownNumber ? card.number : "?";
              if (!card.knownColor || !card.knownNumber) cls += " unknown";
            } else {
              cls += ` ${card.color}`;
              text = card.number;
              cls += card.knownNumber ? " known-number" : " unknown-number";
              cls += card.knownColor ? " known-color" : " unknown-color";
            }

            // 決定是否應用顏色樣式
            let cardStyle = {};
            if (player.isSelf) {
              // 自己的卡片：如果 knownColor 為 true 才顯示顏色
              if (card.knownColor) {
                cardStyle = getCardStyle(card.color);
              }
            } else {
              // 其他玩家的卡片：總是顯示顏色，差別只在邊框樣式
              cardStyle = getCardStyle(card.color);
            }

            return (
              <div 
                key={index} 
                className={cls}
                style={cardStyle}
                title={`顏色: ${card.color}, knownColor: ${card.knownColor}, knownNumber: ${card.knownNumber}, 類別: ${cls}`}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDiscard = () => {
    const grouped = {};
    for (let card of discardPile) {
      const key = card.color;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(card);
    }

    return (
      <div className="discard">
        <strong>棄牌堆</strong>
        <div className="discard-group">
          {Object.keys(grouped).map(color => (
            <div key={color} className="discard-row">
              <div className="discard-cards">
                {grouped[color].map((card, index) => {
                  const colorData = getSafeColorData(card.color);
                  return (
                    <div 
                      key={index} 
                      className="card discard-card"
                      style={{
                        backgroundColor: "transparent",
                        color: colorData.bgColor,
                        border: "none",
                        margin: "1px"
                      }}
                    >
                      {card.number}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFireworks = () => {
    const grouped = {};
    for (let card of fireworks) {
      const key = card.color;
      if (!grouped[key] || grouped[key].number < card.number) {
        grouped[key] = card;
      }
    }

    return (
      <div className="firework-area">
        <strong>煙火</strong>
        <div className="fireworks-group">
          {Object.keys(grouped).map(color => {
            const card = grouped[color];
            return (
              <div key={color} className="fireworks-stack">
                <div 
                  className={`card ${card.color}`}
                  style={getCardStyle(card.color)}
                >
                  {card.number}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
      
      <div className="table">
        <div className="info">
          <div style={{ 
            color: checkGameEnded() ? "#666" : "#d32f2f", 
            fontWeight: "bold", 
            fontSize: "16px",
            marginTop: "5px"
          }}>
            {checkGameEnded() ? "遊戲已結束" : `當前輪到: ${currentPlayer?.name}`}
          </div>
        </div>

        <div className="center">
          {playerCount === 2 && (
            <>
              <div id="player-top" className="player-area">
                {renderPlayer(players[1], 1)}
              </div>
              <div id="player-bottom" className="player-area">
                {renderPlayer(players[0], 0)}
              </div>
            </>
          )}
          
          {playerCount === 3 && (
            <>
              <div id="player-top" className="player-area">
                {renderPlayer(players[1], 1)}
              </div>
              <div id="player-left" className="player-area">
                {renderPlayer(players[2], 2)}
              </div>
              <div id="player-bottom" className="player-area">
                {renderPlayer(players[0], 0)}
              </div>
            </>
          )}
          
          {playerCount === 4 && (
            <>
              <div id="player-left" className="player-area">
                {renderPlayer(players[1], 1)}
              </div>
              <div id="player-top" className="player-area">
                {renderPlayer(players[2], 2)}
              </div>
              <div id="player-right" className="player-area">
                {renderPlayer(players[3], 3)}
              </div>
              <div id="player-bottom" className="player-area">
                {renderPlayer(players[0], 0)}
              </div>
            </>
          )}

        </div>
      </div>

      {/* 棄牌和花火區域 */}
      <div className="game-areas">
        {renderDiscard()}
        {renderFireworks()}
      </div>

      {/* 遊戲記錄表格 */}
      <HanabiGameInfo 
        list={gameState?.gameLog || []} 
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
    </div>
  );
}