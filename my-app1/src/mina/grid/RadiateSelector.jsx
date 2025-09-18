import React, { useState } from 'react';

const RadiateSelector = ({ isOpen, onClose, onConfirm, gameData }) => {
    const [selectedPosition, setSelectedPosition] = useState(null);

    // 判斷是否為最外圍的格子
    const isOuterCell = (row, col) => {
        return row === 0 || row === 7 || col === 0 || col === 9;
    };

    const handlePositionSelect = (row, col) => {
        if (isOuterCell(row, col)) {
            setSelectedPosition({ row, col });
        }
    };

    const handleConfirm = () => {
        if (selectedPosition) {
            onConfirm(selectedPosition);
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
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>選擇放射位置 (10x8 - 僅外圍可選)</h3>
                
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
                        Array.from({ length: 10 }, (_, col) => {
                            const isOuter = isOuterCell(row, col);
                            const isSelected = selectedPosition && selectedPosition.row === row && selectedPosition.col === col;
                            
                            return (
                                <div
                                    key={`${row}-${col}`}
                                    onClick={() => handlePositionSelect(row, col)}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        minWidth: '30px',
                                        minHeight: '30px',
                                        border: '1px solid #ccc',
                                        backgroundColor: isSelected 
                                            ? '#4f8cff' 
                                            : isOuter 
                                                ? '#f0f0f0' 
                                                : '#e0e0e0',
                                        cursor: isOuter ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                                        fontWeight: 'bold',
                                        color: isSelected 
                                            ? 'white' 
                                            : isOuter 
                                                ? '#333' 
                                                : '#999',
                                        transition: 'all 0.2s ease',
                                        opacity: isOuter ? 1 : 0.5
                                    }}
                                    onMouseEnter={(e) => {
                                        if (isOuter && (!selectedPosition || selectedPosition.row !== row || selectedPosition.col !== col)) {
                                            e.target.style.backgroundColor = '#e0e0e0';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (isOuter && (!selectedPosition || selectedPosition.row !== row || selectedPosition.col !== col)) {
                                            e.target.style.backgroundColor = '#f0f0f0';
                                        }
                                    }}
                                >
                                    {row + 1}-{col + 1}
                                </div>
                            );
                        })
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

export default RadiateSelector;
