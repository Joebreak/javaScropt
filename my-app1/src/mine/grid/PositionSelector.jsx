import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const PositionSelector = ({ isOpen, onClose, onConfirm, gameData }) => {
    const [selectedPosition, setSelectedPosition] = useState(null);

    const handlePositionSelect = (row, col) => {
        setSelectedPosition({ row, col });
    };

    const handleConfirm = async () => {
        if (selectedPosition) {
            // 解構 gameData
            const { room, lastRound, mapData } = gameData;

            // 檢查 lastRound 是否存在
            if (!lastRound && lastRound !== 0) {
                console.error('lastRound 不存在，視同 API 失敗');
                setSelectedPosition(null);
                return;
            }

            const { row, col } = selectedPosition;
            let foundData = null;
            if (Array.isArray(mapData) && mapData.length > 0) {
                foundData = mapData.find(item =>
                    item && item.NOTE1 === col && item.NOTE2 === row
                );
            }
            // 準備回傳的資料，包含座標和找到的 NOTE3
            const result = {
                position: selectedPosition,
                note3: foundData ? foundData.NOTE3 : null,
                foundData: foundData || null
            };
            // 根據 NOTE3 決定顏色
            const getColor = (note3) => {
                switch (note3) {
                    case 'TYPE0': return '透明';
                    case 'TYPE1': return '白色';
                    case 'TYPE2': return '紅色';
                    case 'TYPE3': return '藍色';
                    case 'TYPE4': return '黃色';
                    case 'TYPE5': return '黑色';
                    default: return '透明';
                }
            };
            const requestBody = {
                room: room,
                round: lastRound + 1,
                data: {
                    color: getColor(foundData ? foundData.NOTE3 : null),
                    in: "查看位置",
                    out: `${String.fromCharCode(65 + row)}${col + 1}`
                }
            };
            try {
                const apiUrl = getApiUrl('cloudflare_room_url');
                const response = await fetch(apiUrl + requestBody.room, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });
                if (response.ok) {
                    onConfirm(result);
                } else {
                    console.error('API 呼叫失敗:', response.status, response.statusText);
                }
            } catch (error) {
                console.error('API 呼叫錯誤:', error);
            }
            setSelectedPosition(null);
        }
    };

    const handleCancel = () => {
        setSelectedPosition(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>選擇位置 (10x8)</h3>

                {/* 10x8 格子 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, minmax(30px, 1fr))',
                    gridTemplateRows: 'repeat(8, minmax(30px, 1fr))',
                    gap: '2px',
                    marginBottom: '20px',
                    maxWidth: '100%',
                    width: 'min(400px, 90vw)',
                    aspectRatio: '10/8'
                }}>
                    {Array.from({ length: 8 }, (_, row) =>
                        Array.from({ length: 10 }, (_, col) => (
                            <div
                                key={`${row}-${col}`}
                                onClick={() => handlePositionSelect(row, col)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    minWidth: '30px',
                                    minHeight: '30px',
                                    border: '1px solid #ccc',
                                    backgroundColor: selectedPosition && selectedPosition.row === row && selectedPosition.col === col
                                        ? '#4f8cff'
                                        : '#f0f0f0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'clamp(10px, 2.5vw, 12px)',
                                    fontWeight: 'bold',
                                    color: selectedPosition && selectedPosition.row === row && selectedPosition.col === col
                                        ? 'white'
                                        : '#333',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (!selectedPosition || selectedPosition.row !== row || selectedPosition.col !== col) {
                                        e.target.style.backgroundColor = '#e0e0e0';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!selectedPosition || selectedPosition.row !== row || selectedPosition.col !== col) {
                                        e.target.style.backgroundColor = '#f0f0f0';
                                    }
                                }}
                            >
                                {String.fromCharCode(65 + row)}{col + 1}
                            </div>
                        ))
                    )}
                </div>

                {/* 按鈕 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPosition}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedPosition ? '#28a745' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: selectedPosition ? 'pointer' : 'not-allowed'
                        }}
                    >
                        確認
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PositionSelector;
