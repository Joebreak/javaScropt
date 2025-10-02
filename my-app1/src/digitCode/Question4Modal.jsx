import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// 問題4：X + Y 座標選擇
export default function Question4Modal({
    isOpen,
    onClose,
    onConfirm,
    initialXPosition = 'A',
    initialYPosition = 'K',
    gameData,
    list = []
}) {
    const [selectedXPosition, setSelectedXPosition] = useState(initialXPosition);
    const [selectedYPosition, setSelectedYPosition] = useState(initialYPosition);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 位置範圍選項 - 使用 useMemo 優化
    const positionRanges = useMemo(() => [
        {
            range: 'A-I',
            label: 'X座標 (A~I)',
            positions: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
            description: 'A B C D E F G H I'
        },
        {
            range: 'J-S',
            label: 'Y座標 (J~S)',
            positions: ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'],
            description: 'J K L M N O P Q R S'
        }
    ], []);

    // 初始化時確保位置選擇
    useEffect(() => {
        if (initialXPosition) {
            setSelectedXPosition(initialXPosition);
        } else {
            setSelectedXPosition('A');
        }
        if (initialYPosition) {
            setSelectedYPosition(initialYPosition);
        } else {
            setSelectedYPosition('K');
        }
    }, [initialXPosition, initialYPosition]);


    // 解析遊戲答案數據 - 參考 Question1Modal
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

    // 檢查是否有段交集（配置層面）
    const hasSegmentIntersection = () => {
        if (!selectedXPosition || !selectedYPosition) return false;

        const xPositionData = positionMapping[selectedXPosition];
        const yPositionData = positionMapping[selectedYPosition];

        if (!xPositionData || !yPositionData) return false;

        const xSegments = xPositionData.segments;
        const ySegments = yPositionData.segments;

        // 檢查是否有共同的段
        return xSegments.some(segment => ySegments.includes(segment));
    };

    // 檢查 Y 座標是否與當前 X 座標有段交集
    const hasYIntersectionWithX = useCallback((yPosition) => {
        if (!selectedXPosition || !yPosition) return false;

        const xPositionData = positionMapping[selectedXPosition];
        const yPositionData = positionMapping[yPosition];

        if (!xPositionData || !yPositionData) return false;

        const xSegments = xPositionData.segments;
        const ySegments = yPositionData.segments;

        // 檢查是否有共同的段
        return xSegments.some(segment => ySegments.includes(segment));
    }, [selectedXPosition]);

    // 獲取已使用的 X+Y 組合
    const usedCombinations = useMemo(() => {
        return list
            .filter(item => item.type === 4 && item.in)
            .map(item => item.in);
    }, [list]);

    // 檢查 X+Y 組合是否已被使用
    const isCombinationUsed = useCallback((x, y) => {
        return usedCombinations.includes(`${x}+${y}`);
    }, [usedCombinations]);

    // 當 X 座標改變時，自動選擇第一個有交集且未使用的 Y 座標
    useEffect(() => {
        if (selectedXPosition) {
            // 找到第一個與當前 X 座標有交集且未使用的 Y 座標
            const yPositions = positionRanges[1].positions; // J-S
            const firstValidY = yPositions.find(position => 
                hasYIntersectionWithX(position) && !isCombinationUsed(selectedXPosition, position)
            );
            
            if (firstValidY) {
                setSelectedYPosition(firstValidY);
            } else {
                setSelectedYPosition('');
            }
        } else {
            setSelectedYPosition('');
        }
    }, [selectedXPosition, hasYIntersectionWithX, usedCombinations, isCombinationUsed, positionRanges]);

    // 檢查實際數字是否有段交集（基於真實遊戲數據）
    // 返回 null（無配置交集）、true（有實際交集）、false（有配置交集但無實際交集）
    const hasActualSegmentIntersection = () => {
        if (!gameData.answerData) return null;
        if (!selectedXPosition || !selectedYPosition) return null;

        const xPositionData = positionMapping[selectedXPosition];
        const yPositionData = positionMapping[selectedYPosition];

        if (!xPositionData || !yPositionData) return null;

        // 解析真實答案數據
        const parsedData = parseGameData(gameData.answerData);
        if (!parsedData) return null;

        // 找出共同的段
        const commonSegments = xPositionData.segments.filter(segment => yPositionData.segments.includes(segment));

        // 如果沒有配置交集，返回 null
        if (commonSegments.length === 0) {
            return null;
        }

        // 檢查這些共同段是否在實際數字中存在
        for (const segment of commonSegments) {
            // 找出 X 和 Y 座標共同的數字位置
            const commonDigits = xPositionData.digits.filter(digit => yPositionData.digits.includes(digit));

            // 檢查共同的數字位置中是否有這個段
            for (const digit of commonDigits) {
                const number = parsedData[digit];
                if (number === undefined) continue;

                const digitSegments = getDigitSegments(number);
                return digitSegments.includes(segment);
            }
        }

        // 有配置交集但沒有實際交集
        return false;
    };

    // 根據數字獲取段
    const getDigitSegments = (number) => {
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
        return digitSegments[number] || [];
    };

    // 處理提交到API
    const handleConfirm = async () => {
        if (!selectedXPosition || !selectedYPosition) {
            alert("請選擇 X 和 Y 座標");
            return;
        }

        if (!hasSegmentIntersection()) {
            alert("X 和 Y 座標沒有共同的段，無法提交");
            return;
        }

        setIsSubmitting(true);

        try {
            // 檢查實際數字是否有段交集（是否有亮起的段）
            const actualIntersection = hasActualSegmentIntersection();

            // 如果沒有配置交集，不應該到達這裡（按鈕應該被禁用）
            if (actualIntersection === null) {
                alert("X 和 Y 座標沒有共同的段，無法提交");
                return;
            }

            // 準備API請求數據
            const requestBody = {
                room: gameData.room,
                round: gameData.currentRound,
                data: {
                    type: 4, // 問題4的類型
                    in: `${selectedXPosition}+${selectedYPosition}`, // X+Y 座標組合
                    out: actualIntersection // true 或 false
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
                        selectedXPosition,
                        selectedYPosition,
                        hasActualIntersection: actualIntersection,
                        needsRefresh: true // 標記需要更新畫面
                    });
                }
                onClose();
            } else {
                throw new Error('API 調用失敗');
            }
        } catch (error) {
            console.error('問題4提交失敗:', error);
            alert('提交失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setSelectedXPosition(initialXPosition);
        setSelectedYPosition(initialYPosition);
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
                maxWidth: '600px',
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
                    問題4：X + Y 座標設定
                </h2>

                {/* X 座標選擇 (A-I) 和七段顯示器 */}
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'flex-start',
                    marginBottom: '30px' 
                }}>
                    {/* X 座標選擇區域 */}
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            margin: '0 0 15px 0',
                            color: '#495057',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            選擇 X 座標 (A~I)：
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            maxWidth: '300px'
                        }}>
                            {(() => {
                                const positions = positionRanges[0].positions; // A-I
                                const rows = [];

                                // 每3個一排分組
                                for (let i = 0; i < positions.length; i += 3) {
                                    const row = positions.slice(i, i + 3);
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
                                                onClick={() => setSelectedXPosition(position)}
                                                style={{
                                                    padding: '12px 8px',
                                                    border: selectedXPosition === position ? '2px solid #28a745' : '2px solid #e9ecef',
                                                    borderRadius: '8px',
                                                    backgroundColor: selectedXPosition === position ? '#d4edda' : '#f8f9fa',
                                                    color: selectedXPosition === position ? '#155724' : '#495057',
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

                    {/* 七段顯示器面板 - 小尺寸版本 */}
                    {selectedXPosition && selectedYPosition && (() => {
                        const xPositionData = positionMapping[selectedXPosition];
                        const yPositionData = positionMapping[selectedYPosition];
                        if (!xPositionData || !yPositionData) return null;

                        const xSegments = xPositionData.segments;
                        const ySegments = yPositionData.segments;

                        const commonDigits = xPositionData.digits.filter(digit => yPositionData.digits.includes(digit));
                        return (
                            <div style={{ flex: '0 0 auto' }}>
                                <h4 style={{
                                    margin: '0 0 10px 0',
                                    color: '#495057',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    textAlign: 'center'
                                }}>
                                    七段顯示器
                                </h4>
                                {/* 七段顯示器 - 小尺寸 */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{
                                        position: 'relative',
                                        width: '60px',
                                        height: '100px',
                                        backgroundColor: '#1a1a1a',
                                        borderRadius: '4px',
                                        padding: '5px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                    }}>
                                        {/* 段 a (頂部) */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '12px',
                                            width: '36px',
                                            height: '4px',
                                            backgroundColor: xSegments.includes('a') && ySegments.includes('a') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 b (右上) */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '8px',
                                            width: '4px',
                                            height: '32px',
                                            backgroundColor: xSegments.includes('b') && ySegments.includes('b') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 c (右下) */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            right: '8px',
                                            width: '4px',
                                            height: '32px',
                                            backgroundColor: xSegments.includes('c') && ySegments.includes('c') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 d (底部) */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            left: '12px',
                                            width: '36px',
                                            height: '4px',
                                            backgroundColor: xSegments.includes('d') && ySegments.includes('d') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 e (左下) */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '12px',
                                            left: '8px',
                                            width: '4px',
                                            height: '32px',
                                            backgroundColor: xSegments.includes('e') && ySegments.includes('e') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 f (左上) */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '12px',
                                            left: '8px',
                                            width: '4px',
                                            height: '32px',
                                            backgroundColor: xSegments.includes('f') && ySegments.includes('f') ? '#00ff00' : '#333',
                                            borderRadius: '2px'
                                        }}></div>
                                        {/* 段 g (中間) */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '12px',
                                            width: '36px',
                                            height: '4px',
                                            backgroundColor: xSegments.includes('g') && ySegments.includes('g') ? '#00ff00' : '#333',
                                            borderRadius: '2px',
                                            transform: 'translateY(-50%)'
                                        }}></div>
                                    </div>
                                </div>
                                <p style={{
                                    margin: '5px 0 0 0',
                                    color: '#6c757d',
                                    fontSize: '12px',
                                    textAlign: 'center'
                                }}>
                                    交集：{commonDigits.length > 0 ? commonDigits.join('、') : '無'}
                                </p>
                            </div>
                        );
                    })()}
                </div>

                {/* Y 座標選擇 (J-S) */}
                <div style={{ marginBottom: '30px' }}>
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#495057',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}>
                        選擇 Y 座標 (J~S)：
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxWidth: '400px',
                        margin: '0 auto'
                    }}>
                        {(() => {
                            const positions = positionRanges[1].positions; // J-S
                            const rows = [];

                            // 每5個一排分組
                            for (let i = 0; i < positions.length; i += 5) {
                                const row = positions.slice(i, i + 5);
                                rows.push(row);
                            }

                            return rows.map((row, rowIndex) => (
                                <div key={rowIndex} style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}>
                                    {row.map(position => {
                                        const hasIntersection = hasYIntersectionWithX(position);
                                        const isSelected = selectedYPosition === position;
                                        const isUsed = isCombinationUsed(selectedXPosition, position);
                                        const isDisabled = !hasIntersection || isUsed;

                                        return (
                                            <button
                                                key={position}
                                                onClick={() => !isDisabled && setSelectedYPosition(position)}
                                                disabled={isDisabled}
                                                style={{
                                                    padding: '12px 8px',
                                                    border: isUsed ? '2px solid #dc3545' :
                                                        isSelected ? '2px solid #28a745' :
                                                        hasIntersection ? '2px solid #e9ecef' : '2px solid #d6d6d6',
                                                    borderRadius: '8px',
                                                    backgroundColor: isUsed ? '#f8d7da' :
                                                        isSelected ? '#d4edda' :
                                                        hasIntersection ? '#f8f9fa' : '#e9ecef',
                                                    color: isUsed ? '#721c24' :
                                                        isSelected ? '#155724' :
                                                        hasIntersection ? '#495057' : '#6c757d',
                                                    fontSize: '16px',
                                                    fontWeight: 'bold',
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    textAlign: 'center',
                                                    minWidth: '50px',
                                                    opacity: isDisabled ? 0.6 : 1
                                                }}
                                            >
                                                {position}
                                            </button>
                                        );
                                    })}
                                </div>
                            ));
                        })()}
                    </div>
                </div>


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
                        disabled={isSubmitting || !hasSegmentIntersection()}
                        style={{
                            padding: '12px 24px',
                            border: '2px solid #28a745',
                            borderRadius: '8px',
                            backgroundColor: (isSubmitting || !hasSegmentIntersection()) ? '#6c757d' : '#28a745',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: (isSubmitting || !hasSegmentIntersection()) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: (isSubmitting || !hasSegmentIntersection()) ? 0.7 : 1
                        }}
                    >
                        {isSubmitting ? '提交中...' : (!hasSegmentIntersection() ? '無段交集' : '確認提交')}
                    </button>
                </div>
            </div>
        </div>
    );
}
