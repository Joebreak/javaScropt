import React from "react";

export default function HanabiGrid({ 
  players = [], 
  discardPile = [], 
  fireworks = [], 
  currentPlayerIndex = 0,
  getCurrentPlayer,
  checkGameEnded,
  isLastRoundTriggerPlayer,
  hasObserver = false, // 新增觀看者狀態
  currentPlayerRank = 1 // 當前玩家的順位
}) {
  // 獲取卡片樣式的函數 - 簡化版本，不依賴 gameData
  const getCardStyle = (color) => {
    const colorMap = {
      'RED': { backgroundColor: 'crimson', color: '#fff' },
      'GREEN': { backgroundColor: 'seagreen', color: '#fff' },
      'BLUE': { backgroundColor: 'royalblue', color: '#fff' },
      'YELLOW': { backgroundColor: 'goldenrod', color: '#fff' },
      'WHITE': { backgroundColor: 'lightgray', color: '#000' }
    };
    
    return colorMap[color] || { backgroundColor: '#ddd', color: '#999' };
  };

  const renderPlayer = (player, playerIndex) => {
    const isCurrentPlayer = !checkGameEnded() && playerIndex === validCurrentIndex;
    const isLastRoundTrigger = isLastRoundTriggerPlayer(playerIndex);
    const playerClass = `player ${isCurrentPlayer ? 'current-player' : ''}`;
    
    // 除錯資訊
    console.log(`玩家 ${player.name} (rank ${player.rank}): isSelf = ${player.isSelf}`);
    
    // 使用傳入的 hasObserver 參數
    return (
      <div key={player.name} className={playerClass}>
        <strong>
          <span className="player-rank">#{player.rank || playerIndex + 1}</span>
          {player.name} {isLastRoundTrigger ? '👑' : ''}
        </strong>
        <div className="hand">
          {hasObserver ? (
            // 如果有觀看者，所有玩家都顯示背面
            player.hand.map((card, index) => (
              <div 
                key={index} 
                className="card unknown"
                style={{ backgroundColor: '#ddd', color: '#999' }}
                title="觀看者模式 - 無法看到其他玩家的牌"
              >
                ?
              </div>
            ))
          ) : (
            player.hand.map((card, index) => {
            let text = "";
            let cls = "card";

            if (player.isSelf) {
              // 自己的卡片：不顯示，只顯示背面
              console.log(`自己的卡片: ${player.name} (rank ${player.rank})`);
              cls += " unknown";
              text = "?";
            } else {
              // 其他玩家的卡片：顯示真實顏色和數字
              console.log(`其他玩家卡片: ${player.name} (rank ${player.rank}) - ${card.color} ${card.number}`);
              cls += ` ${card.color}`;
              text = card.number;
              cls += card.knownNumber ? " known-number" : " unknown-number";
              cls += card.knownColor ? " known-color" : " unknown-color";
            }

            // 決定是否應用顏色樣式
            let cardStyle = {};
            if (player.isSelf) {
              // 自己的卡片：不顯示顏色，只顯示背面
              cardStyle = { backgroundColor: '#ddd', color: '#999' };
            } else {
              // 其他玩家的卡片：顯示真實顏色
              cardStyle = getCardStyle(card.color);
            }

            return (
              <div 
                key={index} 
                className={cls}
                style={cardStyle}
                title={player.isSelf ? "自己的卡片" : `顏色: ${card.color}, 數字: ${card.number}`}
              >
                {text}
              </div>
            );
          }))}
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
                  const cardStyle = getCardStyle(card.color);
                  return (
                    <div 
                      key={index} 
                      className="card discard-card"
                      style={{
                        backgroundColor: "transparent",
                        color: cardStyle.backgroundColor,
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

  // 除錯資訊
  const playerCount = players.length;
  const validCurrentIndex = playerCount > 0 ? ((currentPlayerIndex % playerCount) + playerCount) % playerCount : 0;

  return (
    <div className="table">
      <div className="info">
        <div style={{ 
          color: checkGameEnded() ? "#666" : "#d32f2f", 
          fontWeight: "bold", 
          fontSize: "16px",
          marginTop: "5px"
        }}>
          {checkGameEnded() ? "遊戲已結束" : `當前輪到: ${getCurrentPlayer()?.name}`}
        </div>
      </div>

      <div className="center">
        {playerCount === 2 && (
          <>
            <div id="player-top" className="player-area">
              {hasObserver ? 
                // 觀看者模式：顯示順位2在上方
                renderPlayer(players.find(p => p.rank === 2) || players[1], 1) :
                // 正常模式：顯示非當前玩家
                renderPlayer(players.find(p => p.rank !== currentPlayerRank) || players.find(p => p.rank === 2) || players[1], 1)
              }
            </div>
            <div id="player-bottom" className="player-area">
              {hasObserver ? 
                // 觀看者模式：顯示順位1在下方
                renderPlayer(players.find(p => p.rank === 1) || players[0], 0) :
                // 正常模式：顯示當前玩家
                renderPlayer(players.find(p => p.rank === currentPlayerRank) || players.find(p => p.rank === 1) || players[0], 0)
              }
            </div>
          </>
        )}
        
        {playerCount === 3 && (
          <>
            <div id="player-top" className="player-area">
              {renderPlayer(players.find(p => p.rank === 1) || players[0], 0)}
            </div>
            <div id="player-left" className="player-area">
              {renderPlayer(players.find(p => p.rank === 2) || players[1], 1)}
            </div>
            <div id="player-bottom" className="player-area">
              {renderPlayer(players.find(p => p.rank === 3) || players[2], 2)}
            </div>
          </>
        )}
        
        {playerCount === 4 && (
          <>
            <div id="player-left" className="player-area">
              {renderPlayer(players.find(p => p.rank === 1) || players[0], 0)}
            </div>
            <div id="player-top" className="player-area">
              {renderPlayer(players.find(p => p.rank === 2) || players[1], 1)}
            </div>
            <div id="player-right" className="player-area">
              {renderPlayer(players.find(p => p.rank === 3) || players[2], 2)}
            </div>
            <div id="player-bottom" className="player-area">
              {renderPlayer(players.find(p => p.rank === 4) || players[3], 3)}
            </div>
          </>
        )}
      </div>

      {/* 棄牌和花火區域 */}
      <div className="game-areas">
        {renderDiscard()}
        {renderFireworks()}
      </div>
    </div>
  );
}
