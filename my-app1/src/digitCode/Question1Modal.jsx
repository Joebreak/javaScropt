import React, { useState, useEffect, useMemo } from 'react';
import { getApiUrl } from '../config/api';

// 位置對應關係和要檢查的段
const positionMapping = {
    'A': { digits: ['T', 'W'], segments: ['e', 'f'] }, // A: T和W的e+f段
    'B': { digits: ['T', 'W'], segments: ['a', 'd', 'g'] }, // B: T和W的a+d+g段
    'C': { digits: ['T', 'W'], segments: ['b', 'c'] }, // C: T和W的b+c段
    'D': { digits: ['U', 'X'], segments: ['e', 'f'] }, // D: U和X的e+f段
    'E': { digits: ['U', 'X'], segments: ['a', 'd', 'g'] }, // E: U和X的a+d+g段
    'F': { digits: ['U', 'X'], segments: ['b', 'c'] }, // F: U和X的b+c段
    'G': { digits: ['V', 'Y'], segments: ['e', 'f'] }, // G: V和Y的e+f段
    'H': { digits: ['V', 'Y'], segments: ['a', 'd', 'g'] }, // H: V和Y的a+d+g段
    'I': { digits: ['V', 'Y'], segments: ['b', 'c'] }, // I: V和Y的b+c段
    'J': { digits: ['T', 'U', 'V'], segments: ['a'] },
    'K': { digits: ['T', 'U', 'V'], segments: ['b', 'f'] },
    'L': { digits: ['T', 'U', 'V'], segments: ['g'] },
    'M': { digits: ['T', 'U', 'V'], segments: ['c', 'e'] },
    'N': { digits: ['T', 'U', 'V'], segments: ['d'] },
     'O': { digits: ['W', 'X', 'Y'], segments: ['a'] },
     'P': { digits: ['W', 'X', 'Y'], segments: ['b', 'f'] },
     'Q': { digits: ['W', 'X', 'Y'], segments: ['g'] },
     'R': { digits: ['W', 'X', 'Y'], segments: ['c', 'e'] },
     'S': { digits: ['W', 'X', 'Y'], segments: ['d'] }
};

// 問題1：位置選擇
export default function Question1Modal({
    isOpen,
    onClose,
    onConfirm,
    initialPosition = 'A',
    gameData
}) {
    const [selectedPosition, setSelectedPosition] = useState(initialPosition);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRange, setSelectedRange] = useState('A-I'); // 追蹤當前選中的範圍

    // 位置範圍選項 - 使用 useMemo 優化
    const positionRanges = useMemo(() => [
        {
            range: 'A-I',
            label: 'A~I',
            positions: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
            description: 'A B C D E F G H I'
        },
        {
            range: 'J-S',
            label: 'J~S',
            positions: ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
            description: 'J K L M N O P Q R S'
        }
    ], []);

    // 初始化時確保範圍和位置一致
    useEffect(() => {
        if (initialPosition) {
            // 根據初始位置確定範圍
            const range = positionRanges.find(r => r.positions.includes(initialPosition));
            if (range) {
                setSelectedRange(range.range);
            }
        } else {
            // 如果沒有初始位置，預設選中 A-I 範圍的第一個位置
            setSelectedPosition('A');
            setSelectedRange('A-I');
        }
    }, [initialPosition, positionRanges]);

    // 當前選中的範圍
    const currentRange = positionRanges.find(r => r.range === selectedRange) || positionRanges[0];

    // 解析遊戲答案數據 - 參考 Question2Modal
    const parseGameData = (data) => {
        if (!data || !Array.isArray(data)) return null;

        // 按照順序提取 NOTE1 值
        const digits = data.map(item => item.NOTE1);
        return {
            T: digits[0], // 第1個數字
            U: digits[1], // 第2個數字
            V: digits[2], // 第3個數字
            W: digits[3], // 第4個數字
            X: digits[4], // 第5個數字
            Y: digits[5]  // 第6個數字
        };
    };

    // 計算指定段個數的函數
    const calculateSegmentCount = (position) => {
        if (!gameData.answerData) return 0;

        // 解析真實答案數據
        const parsedData = parseGameData(gameData.answerData);
        if (!parsedData) return 0;

        const positionData = positionMapping[position];
        if (!positionData) return 0;

        const { digits, segments } = positionData;
        let totalCount = 0;

        digits.forEach(digit => {
            // 從解析後的數據中獲取真實數字
            const number = parsedData[digit];
            if (number !== undefined) {
                // 計算該數字的指定段個數
                const segmentCount = getSegmentCount(number, segments);
                totalCount += segmentCount;
            }
        });

        return totalCount;
    };

    // 根據數字計算指定段個數
    const getSegmentCount = (number, targetSegments) => {
        const digitSegments = {
            0: ['a', 'b', 'c', 'd', 'e', 'f'],
            1: ['b', 'c'],
            2: ['a', 'b', 'g', 'e', 'd'],
            3: ['a', 'b', 'g', 'c', 'd'],
            4: ['f', 'g', 'b', 'c'],
            5: ['a', 'f', 'g', 'c', 'd'],
            6: ['a', 'f', 'g', 'e', 'd', 'c'],
            7: ['a', 'b', 'c'],
            8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            9: ['a', 'b', 'c', 'd', 'f', 'g']
        };

        const segments = digitSegments[number] || [];
        return segments.filter(seg => targetSegments.includes(seg)).length;
    };

    // 處理提交到API
    const handleConfirm = async () => {
        if (!selectedPosition) {
            alert("請選擇位置");
            return;
        }

        setIsSubmitting(true);

        try {
            // 計算指定段個數
            const segmentCount = calculateSegmentCount(selectedPosition);

            // 準備API請求數據
            const requestBody = {
                room: gameData.room,
                round: gameData.currentRound,
                data: {
                    type: 1, // 問題1的類型
                    in: selectedPosition,
                    out: segmentCount
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
                if (onConfirm) {
                    onConfirm({
                        selectedPosition,
                        positionRange: currentRange.range,
                        needsRefresh: true // 標記需要更新畫面
                    });
                }
                onClose();
            } else {
                throw new Error('API 調用失敗');
            }
        } catch (error) {
            console.error('問題1提交失敗:', error);
            alert('提交失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedPosition(initialPosition);
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
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <h2 style={{
                    margin: '0 0 20px 0',
                    color: '#2c3e50',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    問題1：位置設定
                </h2>

                {/* 範圍選擇 */}
                <div style={{ marginBottom: '25px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        選擇位置範圍：
                    </h3>
                    <div style={{
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}>
                        {positionRanges.map(range => (
                            <button
                                key={range.range}
                                onClick={() => {
                                    // 切換範圍時，更新範圍狀態並選中該範圍的第一個位置
                                    setSelectedRange(range.range);
                                    setSelectedPosition(range.positions[0]);
                                }}
                                style={{
                                    padding: '12px 20px',
                                    border: currentRange.range === range.range ? '2px solid #3498db' : '2px solid #e9ecef',
                                    borderRadius: '8px',
                                    backgroundColor: currentRange.range === range.range ? '#e3f2fd' : '#f8f9fa',
                                    color: currentRange.range === range.range ? '#1976d2' : '#495057',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'center'
                                }}
                            >
                                {range.label}<br />
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: 'normal',
                                    display: 'block',
                                    marginTop: '4px'
                                }}>
                                    {range.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 具體位置選擇 */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        選擇具體位置：
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}>
                        {(() => {
                            const positions = currentRange.positions;
                            const rows = [];

                            // 根據範圍決定每排的數量
                            const itemsPerRow = currentRange.range === 'J-S' ? 5 : 3;

                            for (let i = 0; i < positions.length; i += itemsPerRow) {
                                const row = positions.slice(i, i + itemsPerRow);
                                rows.push(row);
                            }

                            return rows.map((row, rowIndex) => (
                                <div key={rowIndex} style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    {row.map(position => (
                                        <button
                                            key={position}
                                            onClick={() => setSelectedPosition(position)}
                                            style={{
                                                padding: '12px 8px',
                                                border: selectedPosition === position ? '2px solid #28a745' : '2px solid #e9ecef',
                                                borderRadius: '8px',
                                                backgroundColor: selectedPosition === position ? '#d4edda' : '#f8f9fa',
                                                color: selectedPosition === position ? '#155724' : '#495057',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'center',
                                                minWidth: '50px'
                                            }}
                                        >
                                            {position}
                                        </button>
                                    ))}
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* a-g 七段顯示器面板 - 根據當前範圍顯示對應的段 */}
                {selectedPosition && currentRange.positions.includes(selectedPosition) && (() => {
                    const positionData = positionMapping[selectedPosition];
                    if (!positionData) return null;

                    const { segments } = positionData;

                    return (
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                margin: '0 0 15px 0',
                                color: '#495057',
                                fontSize: '16px',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                七段顯示器面板 ({currentRange.range} 範圍)：
                            </h3>

                            {/* 七段顯示器 */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: '10px'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    width: '120px',
                                    height: '200px',
                                    backgroundColor: '#1a1a1a',
                                    borderRadius: '8px',
                                    padding: '10px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                                }}>
                                    {/* 段 a (頂部) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        left: '25px',
                                        width: '90px',
                                        height: '8px',
                                        backgroundColor: segments.includes('a') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 b (右上) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '25px',
                                        right: '15px',
                                        width: '8px',
                                        height: '70px',
                                        backgroundColor: segments.includes('b') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 c (右下) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '105px',
                                        right: '15px',
                                        width: '8px',
                                        height: '70px',
                                        backgroundColor: segments.includes('c') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 d (底部) */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '30px',
                                        left: '25px',
                                        width: '90px',
                                        height: '8px',
                                        backgroundColor: segments.includes('d') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 e (左下) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '105px',
                                        left: '15px',
                                        width: '8px',
                                        height: '70px',
                                        backgroundColor: segments.includes('e') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 f (左上) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '25px',
                                        left: '15px',
                                        width: '8px',
                                        height: '70px',
                                        backgroundColor: segments.includes('f') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* 段 g (中間) */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '95px',
                                        left: '25px',
                                        width: '90px',
                                        height: '8px',
                                        backgroundColor: segments.includes('g') ? '#00ff00' : '#333',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }} />
                                </div>
                            </div>

                            <p style={{
                                margin: '10px 0 0 0',
                                color: '#6c757d',
                                fontSize: '12px',
                                textAlign: 'center'
                            }}>
                                {`位置 ${selectedPosition} 檢查 ${positionData.digits.join('、')} 的 ${positionData.segments.join('+')} 段`}
                            </p>
                        </div>
                    );
                })()}


                {/* 按鈕區域 */}
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={handleCancel}
                        style={{
                            padding: '12px 24px',
                            border: '2px solid #6c757d',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa',
                            color: '#6c757d',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        style={{
                            padding: '12px 24px',
                            border: '2px solid #28a745',
                            borderRadius: '8px',
                            backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: isSubmitting ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? '提交中...' : '確認設定'}
                    </button>
                </div>
            </div>
        </div>
    );
}
