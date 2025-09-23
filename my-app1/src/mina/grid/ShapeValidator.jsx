import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const ShapeValidator = ({ isOpen, onClose, onConfirm, gameData }) => {
    const [grid, setGrid] = useState(Array(8).fill().map(() => Array(10).fill(null)));
    const [isValidating, setIsValidating] = useState(false);

    // 定義顏色選項
    const colorTypes = [
        { id: 'TYPE1', name: '白色', color: '#ffffff', borderColor: '#ddd' },
        { id: 'TYPE2', name: '紅色', color: '#ff6b6b', borderColor: '#e74c3c' },
        { id: 'TYPE3', name: '藍色', color: '#3F48CC', borderColor: '#3498db' },
        { id: 'TYPE4', name: '黃色', color: '#feca57', borderColor: '#f39c12' },
        { id: 'TYPE5', name: '黑色', color: '#2c3e50', borderColor: '#000000' },
        { id: 'TRANSPARENT', name: '透明', color: 'transparent', borderColor: '#ccc' }
    ];

    // 定義形狀選項
    const shapeTypes = [
        { id: 'SQUARE', name: '實心', shape: 'square' },
        { id: 'TRIANGLE_UP_LEFT', name: '左上', shape: 'triangle', rotation: 0, type: 'up-left' },
        { id: 'TRIANGLE_UP_RIGHT', name: '右上', shape: 'triangle', rotation: 0, type: 'up-right' },
        { id: 'TRIANGLE_DOWN_LEFT', name: '左下', shape: 'triangle', rotation: 0, type: 'down-left' },
        { id: 'TRIANGLE_DOWN_RIGHT', name: '右下', shape: 'triangle', rotation: 0, type: 'down-right' }
    ];

    // 組合選項狀態
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedShape, setSelectedShape] = useState(null);

    // 從 localStorage 讀取保存的網格
    const loadGridFromStorage = () => {
        try {
            const key = `shapeValidator_${gameData?.room}`;
            console.log('嘗試讀取 localStorage，鍵值:', key);
            const saved = localStorage.getItem(key);
            console.log('讀取到的資料:', saved);
            if (saved) {
                const parsedGrid = JSON.parse(saved);
                setGrid(parsedGrid);
                console.log('從 localStorage 恢復網格成功');
            } else {
                console.log('沒有找到保存的網格資料');
            }
        } catch (error) {
            console.error('讀取保存的網格失敗:', error);
        }
    };

    // 保存網格到 localStorage
    const saveGridToStorage = () => {
        try {
            const key = `shapeValidator_${gameData?.room}`;
            const gridData = JSON.stringify(grid);
            console.log('保存網格到 localStorage，鍵值:', key);
            console.log('網格資料:', gridData);
            localStorage.setItem(key, gridData);
            console.log('網格已保存到 localStorage 成功');
        } catch (error) {
            console.error('保存網格失敗:', error);
        }
    };

    const handleColorSelect = (colorId) => {
        console.log('選擇顏色:', colorId);
        setSelectedColor(colorId);
    };

    const handleShapeSelect = (shapeId) => {
        console.log('選擇形狀:', shapeId);
        setSelectedShape(shapeId);
    };

    // 獲取當前組合的完整選項
    const getCurrentSelection = () => {
        if (!selectedColor || !selectedShape) return null;
        
        const color = colorTypes.find(c => c.id === selectedColor);
        const shape = shapeTypes.find(s => s.id === selectedShape);
        
        return {
            id: `${selectedColor}_${selectedShape}`,
            color: color,
            shape: shape,
            name: `${color.name}${shape.name}`
        };
    };

    const handleCellClick = (row, col) => {
        const currentSelection = getCurrentSelection();
        console.log('點擊格子:', row, col, '選中的組合:', currentSelection);
        
        setGrid(prev => {
            const newGrid = prev.map(row => [...row]); // 深拷貝
            const currentCell = newGrid[row][col];
            
            console.log('當前格子內容:', currentCell);
            
            // 如果格子有圖形，移除它（單個清除功能）
            if (currentCell !== null) {
                newGrid[row][col] = null;
                console.log('移除圖形:', currentCell);
            } 
            // 如果格子是空的且有選中組合，放置選中的圖形
            else if (currentSelection) {
                newGrid[row][col] = currentSelection;
                console.log('放置圖形:', currentSelection);
            } else {
                console.log('沒有選中完整的顏色和形狀組合，無法放置');
            }
            
            console.log('更新後的格子內容:', newGrid[row][col]);
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
    }, [isOpen]);

    // 當網格改變時，保存到 localStorage（但不包括初始載入時）
    React.useEffect(() => {
        if (isOpen) {
            saveGridToStorage();
        }
    }, [grid]);

    // 驗證擺放是否正確
    const validatePlacement = () => {
        if (!gameData?.mapData) {
            console.error('沒有地圖資料');
            return { isValid: false, message: '沒有地圖資料' };
        }

        let correctCount = 0;
        let totalPlaced = 0;
        const errors = [];

        // 檢查每個格子
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 10; col++) {
                const userShape = grid[row][col];
                const mapData = gameData.mapData.find(item => 
                    item && item.NOTE1 === col && item.NOTE2 === row
                );

                if (userShape) {
                    totalPlaced++;
                    const expectedShape = mapData ? mapData.NOTE3 : null;
                    
                    if (userShape === expectedShape) {
                        correctCount++;
                    } else {
                        errors.push({
                            row,
                            col,
                            userShape,
                            expectedShape,
                            message: `位置 (${row}, ${col}): 您放置了 ${shapeTypes.find(s => s.id === userShape)?.name || userShape}，但應該是 ${shapeTypes.find(s => s.id === expectedShape)?.name || expectedShape || '空'}`
                        });
                    }
                } else if (mapData && mapData.NOTE3) {
                    // 使用者沒有放置，但地圖上應該有
                    errors.push({
                        row,
                        col,
                        userShape: null,
                        expectedShape: mapData.NOTE3,
                        message: `位置 (${row}, ${col}): 您沒有放置，但應該是 ${shapeTypes.find(s => s.id === mapData.NOTE3)?.name || mapData.NOTE3}`
                    });
                }
            }
        }

        const accuracy = totalPlaced > 0 ? (correctCount / totalPlaced) * 100 : 0;
        const isValid = errors.length === 0;

        return {
            isValid,
            accuracy,
            correctCount,
            totalPlaced,
            errors,
            message: isValid ? '擺放完全正確！' : `準確率: ${accuracy.toFixed(1)}% (${correctCount}/${totalPlaced})`
        };
    };

    const handleConfirm = async () => {
        setIsValidating(true);
        
        // 先保存當前網格
        saveGridToStorage();
        
        // 解構 gameData
        const { room, lastRound, mapData } = gameData;

        // 檢查 lastRound 是否存在
        if (!lastRound && lastRound !== 0) {
            console.error('lastRound 不存在，視同 API 失敗');
            setIsValidating(false);
            return;
        }

        // 驗證擺放
        const validation = validatePlacement();
        console.log('驗證結果:', validation);

        const result = {
            grid: grid,
            validation: validation,
            timestamp: new Date().toISOString()
        };

        const requestBody = {
            room: room,
            round: lastRound + 1,
            data: {
                type: 'shape_validation',
                grid: grid,
                validation: validation
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
        
        setIsValidating(false);
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
                                            const cellData = cell;
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
                                                    {cellData && (
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
                </div>
            </div>
        </div>
    );
};

export default ShapeValidator;
