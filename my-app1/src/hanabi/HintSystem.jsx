import React, { useState } from 'react';
import { getApiUrl } from '../config/api';
import { 
  COLOR_OPTIONS, 
  NUMBER_OPTIONS
} from './gameData';

// 提示類型常數
export const HINT_TYPES = {
  COLOR: 'color',
  NUMBER: 'number'
};

// 提示系統組件
export default function HintSystem({
  players = [],
  currentPlayerRank,
  onHintGiven,
  onClose,
  room,
  currentRound = 1
}) {
  const [hintType, setHintType] = useState(HINT_TYPES.COLOR);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [targetPlayer, setTargetPlayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 過濾出可以提示的玩家（除了自己）
  const availablePlayers = players.filter(player =>
    player.rank !== currentPlayerRank && !player.isSelf
  );

  // 處理提示提交
  const handleSubmit = async () => {
    if (!targetPlayer) {
      alert('請選擇要提示的玩家');
      return;
    }
    // 檢查提示是否有效（基本驗證）
    if (!isHintValid()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // 準備API請求數據
      const requestBody = {
        room: room,
        round: currentRound,
        data: {
          type: hintType === HINT_TYPES.COLOR ? 1 : 2,
          player: parseInt(targetPlayer),
          in: "",
          out: hintType === HINT_TYPES.COLOR ? selectedColor : parseInt(selectedNumber),
        }
      };
      // 調用API
      const apiUrl = getApiUrl('cloudflare_room_url');
      const response = await fetch(apiUrl + requestBody.room, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        // 通知父組件更新畫面
        if (onHintGiven) {
          onHintGiven({
            needsRefresh: true // 標記需要更新畫面
          });
        }
        // 關閉彈窗
        onClose();
      } else {
        console.error('API 呼叫失敗:', response.status, response.statusText);
        alert('提示提交失敗，請重試');
      }

    } catch (error) {
      console.error('提交提示時發生錯誤:', error);
      alert('提示提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 獲取目標玩家的卡片
  const getTargetPlayerCards = () => {
    const player = players.find(p => p.rank === parseInt(targetPlayer));
    return player ? player.hand : [];
  };

  // 檢查提示是否有效（必須選擇玩家和對應的提示內容）
  const isHintValid = () => {
    if (!targetPlayer) {
      return false;
    }

    // 顏色提示必須選擇顏色
    if (hintType === HINT_TYPES.COLOR && !selectedColor) {
      return false;
    }
    // 檢查數字是否在有效範圍內 (1-5) - 只有當選擇了數字時才檢查
    if (hintType === HINT_TYPES.NUMBER) {
      if (selectedNumber) {
        const numberToCheck = parseInt(selectedNumber);
        if (isNaN(numberToCheck) || numberToCheck < 1 || numberToCheck > 5) {
          alert(`❌ 無效提示：數字必須在 1-5 之間！`);
          return false;
        }
        return true;
      }
      return false;
    }
    return true;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>🎯 提示其他玩家</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {/* 提示類型選擇 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            提示類型：
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value={HINT_TYPES.COLOR}
                checked={hintType === HINT_TYPES.COLOR}
                onChange={(e) => setHintType(e.target.value)}
                style={{ marginRight: '6px' }}
              />
              🎨 顏色提示
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value={HINT_TYPES.NUMBER}
                checked={hintType === HINT_TYPES.NUMBER}
                onChange={(e) => setHintType(e.target.value)}
                style={{ marginRight: '6px' }}
              />
              🔢 數字提示
            </label>
          </div>
        </div>

        {/* 目標玩家選擇 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            選擇要提示的玩家：
          </label>
          <select
            value={targetPlayer}
            onChange={(e) => setTargetPlayer(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          >
            <option value="">請選擇玩家</option>
            {availablePlayers.map(player => (
              <option key={player.rank} value={player.rank}>
                順位{player.rank} - {player.name}
              </option>
            ))}
          </select>
        </div>

        {/* 顏色選擇 */}
        {hintType === HINT_TYPES.COLOR && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              選擇要提示的顏色：
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  style={{
                    padding: '8px 16px',
                    border: selectedColor === color.value ? '2px solid #4f8cff' : '1px solid #ddd',
                    borderRadius: '6px',
                    background: selectedColor === color.value ? '#e3f2fd' : 'white',
                    color: color.color,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {color.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 數字選擇 */}
        {hintType === HINT_TYPES.NUMBER && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              選擇要提示的數字：
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {NUMBER_OPTIONS.map(number => (
                <button
                  key={number}
                  onClick={() => setSelectedNumber(number.toString())}
                  style={{
                    padding: '12px 20px',
                    border: selectedNumber === number.toString() ? '2px solid #4f8cff' : '1px solid #ddd',
                    borderRadius: '6px',
                    background: selectedNumber === number.toString() ? '#e3f2fd' : 'white',
                    color: '#333',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '18px',
                    transition: 'all 0.2s'
                  }}
                >
                  {number}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 目標玩家卡片預覽 */}
        {targetPlayer && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              目標玩家的卡片：
            </label>
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: '6px',
              minHeight: '60px'
            }}>
              {getTargetPlayerCards().map((card, index) => {
                const isHighlighted = hintType === HINT_TYPES.COLOR
                  ? card.color === selectedColor
                  : card.number === parseInt(selectedNumber);

                return (
                  <div
                    key={index}
                    style={{
                      width: '40px',
                      height: '60px',
                      border: isHighlighted ? '3px solid #ff6b6b' : '1px solid #ddd',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isHighlighted ? '#fff3cd' : 'white',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#333'
                    }}
                  >
                    {card.number}
                  </div>
                );
              })}
            </div>
            {targetPlayer && (
              <div style={{
                color: '#4f8cff',
                fontSize: '14px',
                marginTop: '8px',
                fontWeight: 'bold'
              }}>
                💡 將提示：{hintType === HINT_TYPES.COLOR ? `顏色 ${selectedColor}` : `數字 ${selectedNumber}`}
              </div>
            )}
          </div>
        )}

        {/* 按鈕區域 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              background: 'white',
              color: '#666',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isHintValid() || isSubmitting}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: (isHintValid() && !isSubmitting) ? '#4f8cff' : '#ccc',
              color: 'white',
              cursor: (isHintValid() && !isSubmitting) ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isSubmitting ? '送出中...' : '送出提示'}
          </button>
        </div>
      </div>
    </div>
  );
}

// 提示處理工具函數
export const processHint = (hintData, players) => {
  const { type, targetPlayer, value } = hintData;
  const player = players.find(p => p.rank === targetPlayer);

  if (!player) return null;

  // 更新目標玩家的卡片知識
  const updatedHand = player.hand.map(card => {
    if (type === HINT_TYPES.COLOR) {
      return {
        ...card,
        knownColor: card.color === value ? true : card.knownColor
      };
    } else {
      return {
        ...card,
        knownNumber: card.number === value ? true : card.knownNumber
      };
    }
  });

  return {
    ...player,
    hand: updatedHand
  };
};

// 檢查提示是否有效
export const validateHint = (hintData, players) => {
  const { type, targetPlayer, value } = hintData;
  const player = players.find(p => p.rank === targetPlayer);

  if (!player) return false;

  return player.hand.some(card => {
    if (type === HINT_TYPES.COLOR) {
      return card.color === value;
    } else {
      return card.number === value;
    }
  });
};
