import React, { useState } from 'react';
import { getApiUrl } from '../config/api';
import { 
  getColorValue, 
  getColorStyle, 
  getColorChineseName
} from './gameData';

// 出牌系統組件
export default function PlayCardSystem({
    players = [],
    currentPlayerRank,
    onCardPlayed,
    onClose,
    room,
    currentRound = 1,
    gameLog = [], // 遊戲記錄，用於判斷提示資訊
    mapData = [], // 卡片資料，用於獲取卡片 ID
    fireworks = [] // 花火區資料，用於判斷是否能出牌
}) {
    const [selectedCard, setSelectedCard] = useState('');
    const [playDirection, setPlayDirection] = useState('fireworks'); // 'fireworks' 或 'discard'
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 獲取當前玩家的卡片
    const getCurrentPlayerCards = () => {
        const player = players.find(p => p.rank === currentPlayerRank);
        return player ? player.hand : [];
    };

    // 根據遊戲記錄處理卡片提示資訊
    const processCardHints = (cards) => {
        // 如果沒有遊戲記錄，所有卡片都應該是未知的
        if (!gameLog || gameLog.length === 0) {
            return cards.map(card => ({
                ...card,
                knownColor: false,
                knownNumber: false
            }));
        }

        // 這裡可以根據 gameLog 來更新卡片的 knownColor 和 knownNumber
        // 目前先返回原始卡片，後續可以根據實際需求實現
        return cards.map(card => ({
            ...card,
            // 可以根據 gameLog 來更新提示資訊
            knownColor: card.knownColor || false,
            knownNumber: card.knownNumber || false
        }));
    };

    // 檢查出牌是否有效
    const isPlayValid = () => {
        return selectedCard !== '';
    };

    // 處理出牌提交
    const handleSubmit = async () => {
        if (!isPlayValid()) {
            alert('請選擇要出的牌');
            return;
        }

        setIsSubmitting(true);

        try {
            // 獲取選中卡片的 ID
            const selectedCardIndex = parseInt(selectedCard);
            const currentPlayer = players.find(p => p.rank === currentPlayerRank);
            const selectedCardData = currentPlayer?.hand[selectedCardIndex];

            // 從 mapData 中找到對應的卡片 ID
            const cardId = mapData.find(card =>
                card.NOTE2 === getColorValue(selectedCardData?.color) &&
                card.NOTE3 === selectedCardData?.number
            )?.NOTE1;

             // 準備API請求數據
             const requestBody = {
                 room: room,
                 round: currentRound,
                 data: {
                     type: playDirection === 'fireworks' ? 3 : 4, // 3=出牌, 4=棄牌
                     in: cardId, // 卡片 ID (NOTE1)
                     player: currentPlayerRank, // 當前玩家順位
                     out: getCardDisplay(selectedCardData) // 卡片顏色+數字
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
                if (onCardPlayed) {
                    onCardPlayed({
                        needsRefresh: true // 標記需要更新畫面
                    });
                }
                // 關閉彈窗
                onClose();
            } else {
                console.error('API 呼叫失敗:', response.status, response.statusText);
                alert('出牌失敗，請重試');
            }

        } catch (error) {
            console.error('出牌時發生錯誤:', error);
            alert('出牌失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

     // 獲取卡片樣式的函數
     const getCardStyle = (card) => {
         return getColorStyle(card.color);
     };

     // 獲取卡片顯示文字 (顏色+數字)
     const getCardDisplay = (card) => {
         if (!card) return "未知卡片";
         const color = getColorChineseName(card.color);
         const number = card.number || '?';
         return `${color} ${number}`;
     };



    const currentPlayerCards = processCardHints(getCurrentPlayerCards());

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
                    <h2 style={{ margin: 0, color: '#333' }}>🎴 出牌</h2>
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

                {/* 選擇出牌方向 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        出牌方向：
                    </label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                value="fireworks"
                                checked={playDirection === 'fireworks'}
                                onChange={(e) => setPlayDirection(e.target.value)}
                                style={{ marginRight: '6px' }}
                            />
                            🎆 花火區
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                value="discard"
                                checked={playDirection === 'discard'}
                                onChange={(e) => setPlayDirection(e.target.value)}
                                style={{ marginRight: '6px' }}
                            />
                            🗑️ 棄牌區
                        </label>
                    </div>
                </div>

                {/* 選擇卡片 */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                        選擇要出的牌：
                    </label>
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        padding: '12px',
                        background: '#f5f5f5',
                        borderRadius: '6px',
                        minHeight: '80px'
                    }}>
                        {currentPlayerCards.map((card, index) => {
                            const isSelected = selectedCard === index.toString();
                            const cardStyle = getCardStyle(card);

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedCard(index.toString())}
                                    style={{
                                        width: '60px',
                                        height: '80px',
                                        border: isSelected ? '3px solid #ff6b6b' :
                                            (card.knownColor || card.knownNumber) ? '2px solid #4CAF50' : '1px solid #ddd',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: isSelected ? '#fff3cd' :
                                            (card.knownColor || card.knownNumber) ? cardStyle.backgroundColor : '#ddd',
                                        color: cardStyle.color,
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '12px',
                                        marginBottom: '2px',
                                        fontWeight: card.knownColor ? 'bold' : 'normal',
                                        textDecoration: card.knownColor ? 'none' : 'line-through',
                                        color: card.knownColor ? cardStyle.color : '#999'
                                     }}>
                                         {card.knownColor ? getColorChineseName(card.color) : '?'}
                                     </div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        color: card.knownNumber ? cardStyle.color : '#999'
                                    }}>
                                        {card.knownNumber ? card.number : '?'}
                                    </div>
                                    {/* 提示標記 */}
                                    {(card.knownColor || card.knownNumber) && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            width: '8px',
                                            height: '8px',
                                            background: '#4CAF50',
                                            borderRadius: '50%',
                                            fontSize: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white'
                                        }}>
                                            !
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

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
                        disabled={!isPlayValid() || isSubmitting}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            background: (isPlayValid() && !isSubmitting) ? '#4f8cff' : '#ccc',
                            color: 'white',
                            cursor: (isPlayValid() && !isSubmitting) ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {isSubmitting ? '出牌中...' : '確認出牌'}
                    </button>
                </div>
            </div>
        </div>
    );
}
