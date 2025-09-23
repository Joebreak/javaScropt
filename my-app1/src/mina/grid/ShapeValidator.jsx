import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const ShapeValidator = ({ isOpen, onClose, onConfirm, gameData }) => {
    const [grid, setGrid] = useState(Array(8).fill().map(() => Array(10).fill(null)));
    const [isValidating, setIsValidating] = useState(false);

    // 定義顏色選項
    const colorTypes = React.useMemo(() => [
        { id: 'TYPE1', name: '白色', color: '#ffffff', borderColor: '#ddd' },
        { id: 'TYPE2', name: '紅色', color: '#ff6b6b', borderColor: '#e74c3c' },
        { id: 'TYPE3', name: '藍色', color: '#3F48CC', borderColor: '#3498db' },
        { id: 'TYPE4', name: '黃色', color: '#feca57', borderColor: '#f39c12' },
        { id: 'TYPE5', name: '黑色', color: '#2c3e50', borderColor: '#000000' },
        { id: 'TRANSPARENT', name: '透明', color: 'transparent', borderColor: '#ccc' }
    ], []);

    // 定義形狀選項
    const shapeTypes = React.useMemo(() => [
        { id: 'SQUARE', name: '實心', shape: 'square' },
        { id: 'TRIANGLE_UP_LEFT', name: '左上', shape: 'triangle', rotation: 0, type: 'up-left' },
        { id: 'TRIANGLE_UP_RIGHT', name: '右上', shape: 'triangle', rotation: 0, type: 'up-right' },
        { id: 'TRIANGLE_DOWN_LEFT', name: '左下', shape: 'triangle', rotation: 0, type: 'down-left' },
        { id: 'TRIANGLE_DOWN_RIGHT', name: '右下', shape: 'triangle', rotation: 0, type: 'down-right' }
    ], []);

    // 組合選項狀態
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedShape, setSelectedShape] = useState(null);

    // 驗證結果狀態
    const [validationResult, setValidationResult] = useState(null);
    const [showSuccessConfirm, setShowSuccessConfirm] = useState(false);

    // 從 localStorage 讀取保存的網格
    const loadGridFromStorage = React.useCallback(() => {
        try {
            const key = `shapeValidator_${gameData?.room}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsedGrid = JSON.parse(saved);

                // 清理無效的數據
                const cleanedGrid = parsedGrid.map(row =>
                    row.map(cell => {
                        if (!cell) return null;

                        // 處理新格式 {color: selectedColor, shape: selectedShape}
                        if (typeof cell === 'object' && cell.color && cell.shape) {
                            const color = colorTypes.find(c => c.id === cell.color);
                            const shape = shapeTypes.find(s => s.id === cell.shape);

                            if (!color || !shape) {
                                return null;
                            }
                            return cell;
                        }

                        // 如果是舊的對象格式，轉換為新格式
                        if (typeof cell === 'object' && cell.id) {
                            // 嘗試從舊格式解析
                            const parts = cell.id.split('_');
                            if (parts.length >= 2) {
                                const colorId = parts[0];
                                const shapeId = parts.slice(1).join('_');
                                const color = colorTypes.find(c => c.id === colorId);
                                const shape = shapeTypes.find(s => s.id === shapeId);

                                if (color && shape) {
                                    return { color: colorId, shape: shapeId };
                                }
                            }
                            return null;
                        }

                        // 處理舊格式字符串 TYPE3_TRIANGLE_UP_LEFT
                        if (typeof cell === 'string' && cell.includes('_')) {
                            const parts = cell.split('_');
                            const colorId = parts[0];
                            const shapeId = parts.slice(1).join('_');
                            const color = colorTypes.find(c => c.id === colorId);
                            const shape = shapeTypes.find(s => s.id === shapeId);

                            if (!color || !shape) {
                                return null;
                            }
                            return { color: colorId, shape: shapeId };
                        }
                        return null;
                    })
                );

                setGrid(cleanedGrid);
            }
        } catch (error) {
            console.error('讀取保存的網格失敗:', error);
        }
    }, [gameData?.room, colorTypes, shapeTypes]);

    // 保存網格到 localStorage
    const saveGridToStorage = React.useCallback(() => {
        try {
            const key = `shapeValidator_${gameData?.room}`;
            const gridData = JSON.stringify(grid);
            localStorage.setItem(key, gridData);
        } catch (error) {
            console.error('保存網格失敗:', error);
        }
    }, [gameData?.room, grid]);

    const handleColorSelect = (colorId) => {
        setSelectedColor(colorId);
    };

    const handleShapeSelect = (shapeId) => {
        setSelectedShape(shapeId);
    };

    // 獲取當前組合的 ID
    const getCurrentSelection = () => {
        if (!selectedColor || !selectedShape) return null;
        return { color: selectedColor, shape: selectedShape };
    };

    // 根據 ID 獲取顏色和形狀信息
    const getShapeInfo = (shapeId) => {
        if (!shapeId) return null;

        // 處理新格式 {color: selectedColor, shape: selectedShape}
        if (typeof shapeId === 'object' && shapeId.color && shapeId.shape) {
            const color = colorTypes.find(c => c.id === shapeId.color);
            const shape = shapeTypes.find(s => s.id === shapeId.shape);

            if (!color || !shape) {
                console.warn('找不到對應的顏色或形狀:', { colorId: shapeId.color, shapeId: shapeId.shape, color, shape });
                return null;
            }

            return { color, shape, id: `${shapeId.color}_${shapeId.shape}` };
        }

        // 處理舊格式的數據遷移
        if (typeof shapeId === 'object' && shapeId.id) {
            // 如果是舊的對象格式，直接返回
            return shapeId;
        }

        // 處理舊格式 TYPE3_TRIANGLE_UP_LEFT
        if (typeof shapeId === 'string' && shapeId.includes('_')) {
            const parts = shapeId.split('_');
            const colorId = parts[0];
            const shapeIdPart = parts.slice(1).join('_');
            const color = colorTypes.find(c => c.id === colorId);
            const shape = shapeTypes.find(s => s.id === shapeIdPart);

            if (!color || !shape) {
                console.warn('找不到對應的顏色或形狀:', { colorId, shapeIdPart, color, shape, originalShapeId: shapeId });
                return null;
            }

            return { color, shape, id: shapeId };
        }

        console.warn('無法解析的形狀 ID 格式:', shapeId);
        return null;
    };

    const handleCellClick = (row, col) => {
        const currentSelection = getCurrentSelection();

        setGrid(prev => {
            const newGrid = prev.map(row => [...row]); // 深拷貝
            const currentCell = newGrid[row][col];

            // 如果格子有圖形，移除它（單個清除功能）
            if (currentCell !== null) {
                newGrid[row][col] = null;
            }
            // 如果格子是空的且有選中組合，放置選中的圖形
            else if (currentSelection) {
                newGrid[row][col] = currentSelection;
            }
            return newGrid;
        });
    };

    const clearGrid = () => {
        setGrid(Array(8).fill().map(() => Array(10).fill(null)));
    };

    // 當組件開啟時，從 localStorage 讀取網格
    React.useEffect(() => {
        if (isOpen) {
            loadGridFromStorage();
        }
    }, [isOpen, loadGridFromStorage]);

    // 當網格改變時，保存到 localStorage（但不包括初始載入時）
    React.useEffect(() => {
        if (isOpen) {
            saveGridToStorage();
        }
    }, [grid, isOpen, saveGridToStorage]);

    // 將 NOTE3 和 NOTE4 轉換為形狀 ID
    const getExpectedShapeId = (note3, note4) => {
        if (!note3 || !note4) return null;

        // NOTE3 是顏色，NOTE4 是形狀
        const colorId = note3;
        let shapeId;

        // 根據 NOTE4 決定形狀
        switch (note4) {
            case 1: // 實心
                shapeId = 'SQUARE';
                break;
            case 2: // 左上
                shapeId = 'TRIANGLE_UP_LEFT';
                break;
            case 3: // 右上
                shapeId = 'TRIANGLE_UP_RIGHT';
                break;
            case 4: // 左下
                shapeId = 'TRIANGLE_DOWN_LEFT';
                break;
            case 5: // 右下
                shapeId = 'TRIANGLE_DOWN_RIGHT';
                break;
            default:
                return null;
        }

        return `${colorId}_${shapeId}`;
    };

    // 驗證擺放是否正確
    const validatePlacement = () => {
        if (!gameData?.mapData) {
            console.error('沒有地圖資料');
            return { isValid: false, message: '沒有地圖資料' };
        }

        // 檢查每個格子，發現錯誤立即返回
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 10; col++) {
                const userShape = grid[row][col];
                const mapData = gameData.mapData.find(item =>
                    item && item.NOTE1 === col && item.NOTE2 === row
                );

                if (userShape) {
                    const expectedShapeId = mapData ? getExpectedShapeId(mapData.NOTE3, mapData.NOTE4) : null;

                    if (userShape !== expectedShapeId) {
                        console.log(`驗證失敗 - 位置 (${row}, ${col}): 放置了 ${userShape}，但應該是 ${expectedShapeId || '空'}`);
                        return {
                            isValid: false,
                            message: '擺放有誤，請重新檢查'
                        };
                    }
                } else if (mapData && mapData.NOTE3 && mapData.NOTE4) {
                    // 使用者沒有放置，但地圖上應該有
                    const expectedShapeId = getExpectedShapeId(mapData.NOTE3, mapData.NOTE4);
                    console.log(`驗證失敗 - 位置 (${row}, ${col}): 沒有放置，但應該是 ${expectedShapeId}`);
                    return {
                        isValid: false,
                        message: '擺放有誤，請重新檢查'
                    };
                }
            }
        }
        return {
            isValid: true,
            message: '擺放完全正確！'
        };
    };

    const handleConfirm = async () => {
        setIsValidating(true);

        // 先保存當前網格
        saveGridToStorage();

        // 解構 gameData
        const { room, lastRound } = gameData;

        // 檢查 lastRound 是否存在
        if (!lastRound && lastRound !== 0) {
            console.error('lastRound 不存在，視同 API 失敗');
            setIsValidating(false);
            return;
        }

        // 驗證擺放
        const validation = validatePlacement();
        setValidationResult(validation);

        const result = {
            grid: grid,
            validation: {
                isValid: validation.isValid,
                message: validation.message
            },
            timestamp: new Date().toISOString()
        };
        console.log('result:', validation);
        const requestBody = {
            room: room,
            round: lastRound + 1,
            data: {
                in: '提交答案',
                out: '',
                color: validation.isValid ? '獲勝' : '失敗了'
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
                if (validation.isValid) {
                    // 成功：停在當前畫面，顯示確認按鈕
                    setShowSuccessConfirm(true);
                } else {
                    // 失敗：直接離開
                    onConfirm(result);
                }
            } else {
                console.error('API 呼叫失敗:', response.status, response.statusText);
                // API 失敗也直接離開
                onConfirm(result);
            }
        } catch (error) {
            console.error('API 呼叫錯誤:', error);
            // API 錯誤也直接離開
            onConfirm(result);
        }

        setIsValidating(false);
    };

    const handleSuccessConfirm = () => {
        // 成功確認後離開
        const result = {
            grid: grid,
            validation: {
                isValid: validationResult.isValid,
                message: validationResult.message
            },
            timestamp: new Date().toISOString()
        };
        onConfirm(result);
    };

    const handleCancel = () => {
        // 取消時也保存當前網格
        saveGridToStorage();
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
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>圖形擺放驗證</h3>

                {/* 顏色選擇區域 */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666', textAlign: 'center' }}>
                        選擇顏色：
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {colorTypes.map(color => {
                            const isSelected = selectedColor === color.id;
                            return (
                                <div
                                    key={color.id}
                                    onClick={() => handleColorSelect(color.id)}
                                    style={{
                                        padding: '6px 10px',
                                        border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                        borderRadius: '6px',
                                        backgroundColor: '#f8f9fa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                        minWidth: '45px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: color.color,
                                        border: color.id === 'TRANSPARENT' ? '2px dashed #999' : `1px solid ${color.borderColor}`,
                                        borderRadius: '3px',
                                        margin: '0 auto 4px auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        color: color.borderColor,
                                        position: 'relative'
                                    }}>
                                        {color.id === 'TRANSPARENT' ? (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                width: '12px',
                                                height: '12px',
                                                border: '1px solid #999',
                                                borderRadius: '50%',
                                                backgroundColor: 'transparent'
                                            }}></div>
                                        ) : '■'}
                                    </div>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        color: isSelected ? '#4f8cff' : '#333'
                                    }}>
                                        {color.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 形狀選擇區域 */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666', textAlign: 'center' }}>
                        選擇形狀：
                    </div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {shapeTypes.map(shape => {
                            const isSelected = selectedShape === shape.id;
                            return (
                                <div
                                    key={shape.id}
                                    onClick={() => handleShapeSelect(shape.id)}
                                    style={{
                                        padding: '6px 10px',
                                        border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                        borderRadius: '6px',
                                        backgroundColor: '#f8f9fa',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                        minWidth: '45px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#4f8cff',
                                        border: '1px solid #1976d2',
                                        borderRadius: shape.shape === 'triangle' ? '0' : '3px',
                                        margin: '0 auto 4px auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transform: shape.rotation ? `rotate(${shape.rotation}deg)` : 'none',
                                        fontSize: shape.shape === 'square' ? '14px' : '10px',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        {shape.shape === 'triangle' ? (
                                            shape.type === 'up-left' ? '◢' :
                                                shape.type === 'up-right' ? '◣' :
                                                    shape.type === 'down-left' ? '◥' :
                                                        '◤'
                                        ) : '■'}
                                    </div>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 'bold',
                                        color: isSelected ? '#4f8cff' : '#333'
                                    }}>
                                        {shape.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 網格區域 */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666', textAlign: 'center' }}>
                        點擊格子放置圖形，點擊已放置的圖形可清除 (10×8 網格)
                    </div>

                    {/* 網格容器 */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        maxWidth: '500px',
                        margin: '0 auto'
                    }}>
                        {/* 左側行標籤 (A-H) */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginRight: '2px',
                            marginTop: '22px'
                        }}>
                            {Array.from({ length: 8 }, (_, rowIndex) => (
                                <div key={`row-${rowIndex}`} style={{
                                    width: '40px',
                                    height: '40px',
                                    marginBottom: rowIndex < 7 ? '2px' : '0px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: '#666'
                                }}>
                                    {String.fromCharCode(65 + rowIndex)}
                                </div>
                            ))}
                        </div>

                        {/* 網格主體 */}
                        <div>
                            {/* 上方列標籤 (1-10) */}
                            <div style={{
                                display: 'flex',
                                marginBottom: '2px'
                            }}>
                                {Array.from({ length: 10 }, (_, colIndex) => (
                                    <div key={`col-${colIndex}`} style={{
                                        width: '40px',
                                        height: '22px',
                                        marginRight: colIndex < 9 ? '2px' : '0px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        color: '#666'
                                    }}>
                                        {colIndex + 1}
                                    </div>
                                ))}
                            </div>

                            {/* 網格 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {grid.map((row, rowIndex) => (
                                    <div key={`row-${rowIndex}`} style={{
                                        display: 'flex',
                                        marginBottom: rowIndex < 7 ? '2px' : '0px'
                                    }}>
                                        {row.map((cell, colIndex) => {
                                            const cellData = getShapeInfo(cell);
                                            return (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        marginRight: colIndex < 9 ? '2px' : '0px',
                                                        border: cellData && cellData.color.id === 'TRANSPARENT' ? '2px dashed #999' : '1px solid #ccc',
                                                        backgroundColor: cellData ? cellData.color.color : '#f8f9fa',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        color: cellData ? cellData.color.borderColor : '#999',
                                                        transition: 'all 0.2s ease',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {cellData && cellData.shape && (
                                                        <div style={{
                                                            transform: cellData.shape.rotation ? `rotate(${cellData.shape.rotation}deg)` : 'none',
                                                            transition: 'transform 0.2s ease',
                                                            position: 'relative'
                                                        }}>
                                                            {cellData.shape.shape === 'triangle' ? (
                                                                cellData.color.id === 'TRANSPARENT' ? (
                                                                    <div style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        border: '2px solid #999',
                                                                        clipPath: cellData.shape.type === 'up-left' ? 'polygon(100% 0%, 100% 100%, 0% 100%)' :
                                                                            cellData.shape.type === 'up-right' ? 'polygon(0% 0%, 0% 100%, 100% 100%)' :
                                                                                cellData.shape.type === 'down-left' ? 'polygon(100% 0%, 100% 100%, 0% 0%)' :
                                                                                    'polygon(0% 0%, 100% 0%, 0% 100%)',
                                                                        backgroundColor: 'transparent'
                                                                    }}></div>
                                                                ) : (
                                                                    <span style={{ fontSize: '40px' }}>
                                                                        {cellData.shape.type === 'up-left' ? '◢' :
                                                                            cellData.shape.type === 'up-right' ? '◣' :
                                                                                cellData.shape.type === 'down-left' ? '◥' :
                                                                                    '◤'}
                                                                    </span>
                                                                )
                                                            ) : (
                                                                cellData.color.id === 'TRANSPARENT' ? (
                                                                    <div style={{
                                                                        width: '20px',
                                                                        height: '20px',
                                                                        border: '2px solid #999',
                                                                        backgroundColor: 'transparent'
                                                                    }}></div>
                                                                ) : (
                                                                    <span style={{
                                                                        fontSize: '50px',
                                                                        position: 'relative',
                                                                        top: '-8px'
                                                                    }}>■</span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 操作按鈕 */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <button
                        onClick={clearGrid}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#ffc107',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        清空網格
                    </button>
                </div>

                {/* 驗證結果顯示 */}
                {validationResult && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '15px',
                        backgroundColor: validationResult.isValid ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${validationResult.isValid ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '4px',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: validationResult.isValid ? '#155724' : '#721c24'
                        }}>
                            {validationResult.message}
                        </div>
                    </div>
                )}

                {/* 按鈕 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {showSuccessConfirm ? (
                        // 成功時顯示確認按鈕
                        <button
                            onClick={handleSuccessConfirm}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            確認完成
                        </button>
                    ) : (
                        // 一般狀態顯示取消和驗證按鈕
                        <>
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
                                disabled={isValidating}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: isValidating ? '#ccc' : '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: isValidating ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isValidating ? '驗證中...' : '確認驗證'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShapeValidator;
