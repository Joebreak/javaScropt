import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const RadiateSelector = ({ isOpen, onClose, onConfirm, gameData }) => {
    const [selectedDirection, setSelectedDirection] = useState(null);

    // 定義四列選項及其對應的進入座標
    const directionOptions = [
        // 1~10（上側，從上往下進入）
        ...Array.from({ length: 10 }, (_, col) => ({
            type: 'col',
            index: col,
            label: String(col + 1),
            side: 'top',
            entryPoint: { row: -1, col: col } // 從上方進入
        })),
        // I~R（下側，從下往上進入）
        ...Array.from({ length: 10 }, (_, col) => ({
            type: 'col',
            index: col,
            label: String.fromCharCode('I'.charCodeAt(0) + col),
            side: 'bottom',
            entryPoint: { row: 8, col: col } // 從下方進入
        })),
        // A~H（左側，從左往右進入）
        ...Array.from({ length: 8 }, (_, row) => ({
            type: 'row',
            index: row,
            label: String.fromCharCode('A'.charCodeAt(0) + row),
            side: 'left',
            entryPoint: { row: row, col: -1 } // 從左方進入
        })),
        // 11~18（右側，從右往左進入）
        ...Array.from({ length: 8 }, (_, row) => ({
            type: 'row',
            index: row,
            label: String(11 + row),
            side: 'right',
            entryPoint: { row: row, col: 10 } // 從右方進入
        }))
    ];

    // 將 NOTE3 轉換為顏色名稱
    const getColorName = (note3) => {
        switch (note3) {
            case 'TYPE1': return '白色';
            case 'TYPE2': return '紅色';
            case 'TYPE3': return '藍色';
            case 'TYPE4': return '黃色';
            case 'TYPE5': return '黑色';
            default: return '透明';
        }
    };

    // 根據所有遇到的顏色計算最終顏色
    const calculateFinalColor = (encounteredColors) => {
        // 過濾掉透明和空值
        const validColors = encounteredColors
            .map(color => getColorName(color))
            .filter(color => color !== '透明' && color !== null && color !== undefined);

        if (validColors.length === 0) {
            return '透明';
        }

        // 如果遇到黑色，被吸收
        if (validColors.includes('黑色')) {
            return '被吸收';
        }

        // 檢查是否有白色
        const hasWhite = validColors.includes('白色');
        const nonWhiteColors = validColors.filter(color => color !== '白色');

        // 如果只有白色，保持白色
        if (nonWhiteColors.length === 0) {
            return '白色';
        }

        // 檢查是否有紅、藍、黃三種顏色（黑色）
        const uniqueColors = [...new Set(nonWhiteColors)];
        if (uniqueColors.includes('紅色') && uniqueColors.includes('藍色') && uniqueColors.includes('黃色')) {
            return '黑色';
        }

        // 顏色混合規則（只考慮非白色顏色）
        const colorSet = new Set(uniqueColors);

        if (colorSet.has('紅色') && colorSet.has('藍色')) {
            return hasWhite ? '淺紫' : '紫色';
        }
        if (colorSet.has('紅色') && colorSet.has('黃色')) {
            return hasWhite ? '淺綠' : '綠色';
        }
        if (colorSet.has('藍色') && colorSet.has('黃色')) {
            return hasWhite ? '淺橙' : '橙色';
        }

        // 如果只有一種顏色
        if (uniqueColors.length === 1) {
            const singleColor = uniqueColors[0];
            return hasWhite ? `淺${singleColor}` : singleColor;
        }

        // 如果只有兩種顏色但不符合混合規則，返回第一種
        return hasWhite ? `淺${uniqueColors[0]}` : uniqueColors[0];
    };

    // 取得某座標的地圖資料（避免在迴圈中宣告函式）
    const getCellDataAt = (row, col, map) => {
        return map.find(item => item && item.NOTE1 === col && item.NOTE2 === row) || null;
    };

    // 光線追蹤函數
    const traceLightPath = (entryPoint, direction, mapData) => {
        const path = [];
        const encounteredColors = []; // 記錄所有遇到的顏色
        let currentRow = entryPoint.row;
        let currentCol = entryPoint.col;
        let currentDirection = direction;

        // 根據進入方向決定初始移動方向
        const getInitialDirection = (side) => {
            switch (side) {
                case 'top': return 'down';
                case 'right': return 'left';
                case 'left': return 'right';
                case 'bottom': return 'up';
                default: return 'down';
            }
        };

        currentDirection = getInitialDirection(selectedDirection.side);
        // 移動到第一個格子
        const moveToNext = (row, col, dir) => {
            switch (dir) {
                case 'down': return { row: row + 1, col };
                case 'up': return { row: row - 1, col };
                case 'right': return { row, col: col + 1 };
                case 'left': return { row, col: col - 1 };
                default: return { row, col };
            }
        };

        // 檢查是否在邊界內
        const isInBounds = (row, col) => {
            return row >= 0 && row < 8 && col >= 0 && col < 10;
        };
        // 開始追蹤
        while (true) {
            // 計算下一個位置
            const nextPos = moveToNext(currentRow, currentCol, currentDirection);
            
            // 檢查是否在邊界內
            if (!isInBounds(nextPos.row, nextPos.col)) break;
            
            // 移動到新位置
            currentRow = nextPos.row;
            currentCol = nextPos.col;

            // 在 mapData 中尋找當前位置的資料（避免在迴圈中宣告函式）
            const cellData = getCellDataAt(currentRow, currentCol, mapData);

            // 記錄遇到的顏色
            if (cellData && cellData.NOTE3) {
                encounteredColors.push(cellData.NOTE3);
            }

            // 計算當前顏色
            const currentColor = calculateFinalColor(encounteredColors);

            // 如果被吸收，停止追蹤
            if (currentColor === '被吸收') {
                path.push({
                    row: currentRow,
                    col: currentCol,
                    note3: cellData ? cellData.NOTE3 : null,
                    note4: cellData ? cellData.NOTE4 : null,
                    color: '被吸收',
                    encounteredColors: [...encounteredColors]
                });
                break;
            }

            path.push({
                row: currentRow,
                col: currentCol,
                note3: cellData ? cellData.NOTE3 : null,
                note4: cellData ? cellData.NOTE4 : null,
                color: currentColor,
                encounteredColors: [...encounteredColors]
            });

            // 檢查 NOTE3 是否為 null
            if (cellData && cellData.NOTE3 === null) {
                // 繼續直線前進
                continue;
            }

            // 檢查 NOTE4 角度
            if (cellData && cellData.NOTE4) {
                const angle = cellData.NOTE4;

                if (angle === 1) {
                    // 停下來
                    break;
                } else if (angle === 2) {
                    // 從左邊到上面 或 從上面到左邊
                    if (currentDirection === 'left') {
                        currentDirection = 'up';
                    } else if (currentDirection === 'up') {
                        currentDirection = 'left';
                    } else {
                        break; // 其他方向停下來
                    }
                } else if (angle === 3) {
                    // 從右邊到上面 或 從上面到右邊
                    if (currentDirection === 'right') {
                        currentDirection = 'up';
                    } else if (currentDirection === 'up') {
                        currentDirection = 'right';
                    } else {
                        break; // 其他方向停下來
                    }
                } else if (angle === 4) {
                    // 從左邊到下面 或 從下面到左邊
                    if (currentDirection === 'left') {
                        currentDirection = 'down';
                    } else if (currentDirection === 'down') {
                        currentDirection = 'left';
                    } else {
                        break; // 其他方向停下來
                    }
                } else if (angle === 5) {
                    // 從右邊到下面 或 從下面到右邊
                    if (currentDirection === 'right') {
                        currentDirection = 'down';
                    } else if (currentDirection === 'down') {
                        currentDirection = 'right';
                    } else {
                        break; // 其他方向停下來
                    }
                } else {
                    // 其他角度停下來
                    break;
                }
            } else {
                // 沒有 NOTE4 資料，停下來
                break;
            }
        }

        // 計算最終顏色
        const finalColor = calculateFinalColor(encounteredColors);

        return {
            path: path,
            finalColor: finalColor,
            encounteredColors: encounteredColors
        };
    };

    const handleConfirm = async () => {
        if (selectedDirection) {
            // 解構 gameData
            const { room, lastRound, mapData } = gameData;

            // 檢查 lastRound 是否存在
            if (!lastRound && lastRound !== 0) {
                console.error('lastRound 不存在，視同 API 失敗');
                setSelectedDirection(null);
                return;
            }

            // 執行光線追蹤
            const lightTraceResult = traceLightPath(selectedDirection.entryPoint, selectedDirection.side, mapData || []);

            console.log('光線追蹤結果:', {
                finalColor: lightTraceResult.finalColor,
                pathLength: lightTraceResult.path.length,
                lastPath: lightTraceResult.path[lightTraceResult.path.length - 1]
            });
            const result = {
                direction: selectedDirection,
                type: selectedDirection.type,
                index: selectedDirection.index,
                label: selectedDirection.label,
                side: selectedDirection.side,
                entryPoint: selectedDirection.entryPoint,
                lightPath: lightTraceResult.path,
                finalColor: lightTraceResult.finalColor,
                encounteredColors: lightTraceResult.encounteredColors
            };

            // 決定 in 和 out 格式
            const inFormat = selectedDirection.label; // 直接使用選擇的標籤 (1, I, A, 11 等)

            let outFormat = "";
            if (lightTraceResult.finalColor === '被吸收') {
                outFormat = "";
            } else {
                // 如果沒有被吸收，計算出口位置
                const lastPath = lightTraceResult.path[lightTraceResult.path.length - 1];
                if (lastPath) {
                    const { row, col } = lastPath;
                    // 根據最後位置決定出口格式
                    if (row === 0) {
                        outFormat = String(col + 1); // 從上方出來，回復到 1~10 格式
                    } else if (row === 7) {
                        outFormat = String.fromCharCode('I'.charCodeAt(0) + col); // 從下方出來，回復到 I~R 格式
                    } else if (col === 0) {
                        outFormat = String.fromCharCode('A'.charCodeAt(0) + row); // 從左方出來，回復到 A~H 格式
                    } else if (col === 9) {
                        outFormat = String(11 + row); // 從右方出來，回復到 11~18 格式
                    } else {
                        outFormat = inFormat;
                    }
                } else {
                    // 如果沒有路徑資料，光線穿過整個網格，從對面出來
                    // 根據進入方向計算對面出口
                    const { side, index } = selectedDirection;
                    if (side === 'top') {
                        outFormat = String.fromCharCode('I'.charCodeAt(0) + index); // 從下方出來，回復到 I~R 格式
                    } else if (side === 'bottom') {
                        outFormat = String(index + 1); // 從上方出來，回復到 1~10 格式
                    } else if (side === 'left') {
                        outFormat = String(11 + index); // 從右方出來，回復到 11~18 格式
                    } else if (side === 'right') {
                        outFormat = String.fromCharCode('A'.charCodeAt(0) + index); // 從左方出來，回復到 A~H 格式
                    }
                }
            }

            const requestBody = {
                room: room.substring(0, 4),
                round: lastRound + 1,
                data: {
                    color: lightTraceResult.finalColor, // 直接使用最終顏色（包含"被吸收"）
                    in: inFormat, // 進入標籤
                    out: outFormat // 出口位置，被吸收時為空字串
                }
            };
            console.log(requestBody.data);
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
            setSelectedDirection(null);
        }
    };

    const handleCancel = () => {
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
                maxWidth: '95vw',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>選擇發射光方向</h3>

                {/* 1~10（上側，欄） */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>1~10（上側）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                        {Array.from({ length: 10 }, (_, col) => {
                            const option = directionOptions.find(opt => opt.side === 'top' && opt.index === col);
                            const isSelected = selectedDirection && selectedDirection.side === 'top' && selectedDirection.index === col;
                            return (
                                <div
                                    key={`top-${col}`}
                                    onClick={() => setSelectedDirection(option)}
                                    style={{
                                        textAlign: 'center',
                                        padding: '8px 4px',
                                        border: '2px solid #ccc',
                                        borderRadius: '6px',
                                        backgroundColor: isSelected ? '#4f8cff' : '#f8f9fa',
                                        color: isSelected ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        userSelect: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {col + 1}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* I~R（下側，欄） */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>I~R（下側）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
                        {Array.from({ length: 10 }, (_, col) => {
                            const option = directionOptions.find(opt => opt.side === 'bottom' && opt.index === col);
                            const isSelected = selectedDirection && selectedDirection.side === 'bottom' && selectedDirection.index === col;
                            return (
                                <div
                                    key={`right-${col}`}
                                    onClick={() => setSelectedDirection(option)}
                                    style={{
                                        textAlign: 'center',
                                        padding: '8px 4px',
                                        border: '2px solid #ccc',
                                        borderRadius: '6px',
                                        backgroundColor: isSelected ? '#4f8cff' : '#f8f9fa',
                                        color: isSelected ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        userSelect: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {String.fromCharCode('I'.charCodeAt(0) + col)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* A~H（左側，列） */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>A~H（左側）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                        {Array.from({ length: 8 }, (_, row) => {
                            const option = directionOptions.find(opt => opt.side === 'left' && opt.index === row);
                            const isSelected = selectedDirection && selectedDirection.side === 'left' && selectedDirection.index === row;
                            return (
                                <div
                                    key={`left-${row}`}
                                    onClick={() => setSelectedDirection(option)}
                                    style={{
                                        textAlign: 'center',
                                        padding: '8px 4px',
                                        border: '2px solid #ccc',
                                        borderRadius: '6px',
                                        backgroundColor: isSelected ? '#4f8cff' : '#f8f9fa',
                                        color: isSelected ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        userSelect: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {String.fromCharCode('A'.charCodeAt(0) + row)}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 11~18（右側，列） */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>11~18（右側）</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                        {Array.from({ length: 8 }, (_, row) => {
                            const option = directionOptions.find(opt => opt.side === 'right' && opt.index === row);
                            const isSelected = selectedDirection && selectedDirection.side === 'right' && selectedDirection.index === row;
                            return (
                                <div
                                    key={`bottom-${row}`}
                                    onClick={() => setSelectedDirection(option)}
                                    style={{
                                        textAlign: 'center',
                                        padding: '8px 4px',
                                        border: '2px solid #ccc',
                                        borderRadius: '6px',
                                        backgroundColor: isSelected ? '#4f8cff' : '#f8f9fa',
                                        color: isSelected ? 'white' : '#333',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        userSelect: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {11 + row}
                                </div>
                            );
                        })}
                    </div>
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
                        disabled={!selectedDirection}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: selectedDirection ? '#28a745' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: selectedDirection ? 'pointer' : 'not-allowed'
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
