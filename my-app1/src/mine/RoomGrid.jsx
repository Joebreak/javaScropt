import React, { useState, useEffect } from "react";
import PositionSelector from "./grid/PositionSelector";
import RadiateSelector from "./grid/RadiateSelector";
import "./MineRoom.css";

const rows = 8;
const cols = 10;
const getGridConfig = () => {
    if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width <= 480) {
            return {
                cellSize: 30,
                gap: 2
            };
        }
        if (width <= 768) {
            return {
                cellSize: 40,
                gap: 3
            };
        }
        return {
            cellSize: 60,
            gap: 4
        };
    }
    return {
        cellSize: 40,
        gap: 3
    };
};


const initGrid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

const leftRowLabels = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

const rightRowLabels = Array.from({ length: rows }, (_, i) => i + 11);

const bottomColLabels = Array.from({ length: cols }, (_, i) => String.fromCharCode("I".charCodeAt(0) + i));

// 定義顏色選項
const colorTypes = [
    { id: 'TYPE1', name: '白色', color: '#ffffff', borderColor: '#ddd' },
    { id: 'TYPE2', name: '紅色', color: '#ff6b6b', borderColor: '#e74c3c' },
    { id: 'TYPE3', name: '藍色', color: '#3F48CC', borderColor: '#3498db' },
    { id: 'TYPE4', name: '黃色', color: '#feca57', borderColor: '#FFF200' },
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


function MinaRoom({ 
  gameData, 
  showShapeSelector = false,
  setShowShapeSelector = null,
  showPositionSelector,
  setShowPositionSelector,
  showRadiateSelector,
  setShowRadiateSelector,
  onPositionConfirm,
  onRadiateConfirm
}) {
    const [currentCellSize, setCurrentCellSize] = useState(getGridConfig().cellSize);
    
    // 網格狀態（用於形狀驗證）
    const [grid, setGrid] = useState(Array(8).fill().map(() => Array(10).fill(null)));
    
    // 選擇器狀態
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedShape, setSelectedShape] = useState(null);

    useEffect(() => {
        const handleResize = () => {
            setCurrentCellSize(getGridConfig().cellSize);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    // 從 localStorage 讀取網格
    const loadGridFromStorage = React.useCallback(() => {
        try {
            const key = `roomGrid_${gameData?.room || 'default'}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                const parsedGrid = JSON.parse(saved);
                setGrid(parsedGrid);
                console.log('網格已從 localStorage 載入');
            }
        } catch (error) {
            console.error('載入網格失敗:', error);
        }
    }, [gameData?.room]);

    // 當組件載入時，從 localStorage 讀取網格
    useEffect(() => {
        loadGridFromStorage();
    }, [loadGridFromStorage]);

    // 當 gameData 改變時，重新載入對應房間的網格
    useEffect(() => {
        if (gameData?.room) {
            loadGridFromStorage();
        }
    }, [gameData?.room, loadGridFromStorage]);


    // 顏色和形狀選擇處理
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

        if (typeof shapeId === 'object' && shapeId.color && shapeId.shape) {
            const color = colorTypes.find(c => c.id === shapeId.color);
            const shape = shapeTypes.find(s => s.id === shapeId.shape);

            if (!color || !shape) {
                return null;
            }

            return { color, shape, id: `${shapeId.color}_${shapeId.shape}` };
        }

        return null;
    };

    // 保存網格到 localStorage
    const saveGridToStorage = (gridData) => {
        try {
            const key = `roomGrid_${gameData?.room || 'default'}`;
            localStorage.setItem(key, JSON.stringify(gridData));
            console.log('網格已保存到 localStorage');
        } catch (error) {
            console.error('保存網格失敗:', error);
        }
    };

    // 網格點擊處理
    const handleCellClick = (row, col) => {
        const currentSelection = getCurrentSelection();

        setGrid(prev => {
            const newGrid = prev.map(row => [...row]);
            const currentCell = newGrid[row][col];

            if (currentCell !== null) {
                // 移除圖形
                newGrid[row][col] = null;
                console.log(`移除圖形: 位置 (${row}, ${col})`);
            } else if (currentSelection) {
                // 放置圖形
                newGrid[row][col] = currentSelection;
                console.log(`放置圖形: 位置 (${row}, ${col}), 顏色: ${currentSelection.color}, 形狀: ${currentSelection.shape}`);
            }
            
            // 保存到 localStorage
            saveGridToStorage(newGrid);
            return newGrid;
        });
    };

    // 清空網格
    const clearGrid = () => {
        const emptyGrid = Array(8).fill().map(() => Array(10).fill(null));
        setGrid(emptyGrid);
        saveGridToStorage(emptyGrid);
        console.log('網格已清空並保存');
    };


    return (
        <div style={{ padding: 0, position: "relative", background: "#f7f7f7" }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: `${currentCellSize}px repeat(${rows}, ${currentCellSize}px) ${currentCellSize}px`, // 上 + 中間 + 下
                    gridTemplateColumns: `${currentCellSize}px repeat(${cols}, ${currentCellSize}px) ${currentCellSize}px`, // 左 + 中間 + 右
                    gap: getGridConfig().gap,
                    justifyContent: "center",
                    marginBottom: window.innerWidth <= 480 ? 20 : 40,
                }}
            >
                <div style={{}} />
                {Array.from({ length: cols }, (_, cIdx) => (
                    <div
                        key={`col-header-${cIdx}`}
                        className="grid-label"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {cIdx + 1}
                    </div>
                ))}
                <div style={{}} />
                {/* 行號 + 格子 */}
                {initGrid.map((row, rIdx) => (
                    <React.Fragment key={`row-${rIdx}`}>
                        <div
                            className="grid-label"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {leftRowLabels[rIdx]}
                        </div>
                        {row.map((_, cIdx) => {
                            const cellData = getShapeInfo(grid[rIdx][cIdx]);
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => handleCellClick(rIdx, cIdx)}
                                    style={{
                                        border: cellData && cellData.color.id === 'TRANSPARENT' ? '2px dashed #999' : '1px solid #ccc',
                                        background: '#fff',
                                        width: `${currentCellSize}px`,
                                        height: `${currentCellSize}px`,
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
                        <div
                            className="grid-label"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontWeight: "bold",
                                fontSize: "14px",
                            }}
                        >
                            {rightRowLabels[rIdx]}
                        </div>
                    </React.Fragment>
                ))}
                <div style={{}} /> {/* 右上角空白 */}
                {Array.from({ length: cols }, (_, cIdx) => (
                    <div
                        key={`bottom-${cIdx}`}
                        className="grid-label"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: "bold",
                            fontSize: "14px",
                        }}
                    >
                        {bottomColLabels[cIdx]}
                    </div>
                ))}
            </div>

            {/* 當前選擇顯示 */}
            <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: selectedColor && selectedShape ? '#e8f5e8' : '#fff3e0',
                borderRadius: '6px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: selectedColor && selectedShape ? '#2e7d32' : '#f57c00',
                border: selectedColor && selectedShape ? '1px solid #c8e6c9' : '1px solid #ffcc02'
            }}>
                {selectedColor && selectedShape ? (
                    <>目前選擇：<span style={{ color: colorTypes.find(c => c.id === selectedColor)?.borderColor }}>{colorTypes.find(c => c.id === selectedColor)?.name}</span> + <span style={{ color: '#1976d2' }}>{shapeTypes.find(s => s.id === selectedShape)?.name}</span></>
                ) : (
                    <>請選擇顏色和形狀：{selectedColor ? colorTypes.find(c => c.id === selectedColor)?.name : '未選擇顏色'} + {selectedShape ? shapeTypes.find(s => s.id === selectedShape)?.name : '未選擇形狀'}</>
                )}
            </div>

            {/* 形狀選擇器 - 顯示在網格和按鈕之間 */}
            {showShapeSelector && (
                <div style={{ 
                    marginTop: '20px',
                    marginBottom: '20px', 
                    padding: '15px', 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* 隱藏圖形按鈕 */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <button
                            onClick={() => setShowShapeSelector && setShowShapeSelector(false)}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            隱藏圖形
                        </button>
                    </div>
                    
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#666', textAlign: 'center' }}>
                        選擇顏色和形狀：
                    </div>
                    
                    {/* 顏色選擇區域 */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#666', textAlign: 'center' }}>
                            顏色：
                        </div>
                        
                        {/* 第一排：白色、紅色、藍色、黃色 */}
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                            {colorTypes.slice(0, 4).map(color => {
                                const isSelected = selectedColor === color.id;
                                return (
                                    <div
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.id)}
                                        style={{
                                            padding: '4px 8px',
                                            border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                            borderRadius: '4px',
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            userSelect: 'none',
                                            minWidth: '35px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: color.color,
                                            border: color.id === 'TRANSPARENT' ? '2px dashed #999' : `1px solid ${color.borderColor}`,
                                            borderRadius: '2px',
                                            margin: '0 auto 2px auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8px',
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
                                                    width: '8px',
                                                    height: '8px',
                                                    border: '1px solid #999',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'transparent'
                                                }}></div>
                                            ) : '■'}
                                        </div>
                                        <span style={{
                                            fontSize: '8px',
                                            fontWeight: 'bold',
                                            color: isSelected ? '#4f8cff' : '#333'
                                        }}>
                                            {color.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* 第二排：黑色、透明 */}
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {colorTypes.slice(4).map(color => {
                                const isSelected = selectedColor === color.id;
                                return (
                                    <div
                                        key={color.id}
                                        onClick={() => handleColorSelect(color.id)}
                                        style={{
                                            padding: '4px 8px',
                                            border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                            borderRadius: '4px',
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            userSelect: 'none',
                                            minWidth: '35px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: color.color,
                                            border: color.id === 'TRANSPARENT' ? '2px dashed #999' : `1px solid ${color.borderColor}`,
                                            borderRadius: '2px',
                                            margin: '0 auto 2px auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8px',
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
                                                    width: '8px',
                                                    height: '8px',
                                                    border: '1px solid #999',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'transparent'
                                                }}></div>
                                            ) : '■'}
                                        </div>
                                        <span style={{
                                            fontSize: '8px',
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
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#666', textAlign: 'center' }}>
                            形狀：
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'flex-start' }}>
                            {/* 左邊：實心 */}
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {shapeTypes.slice(0, 1).map(shape => {
                                    const isSelected = selectedShape === shape.id;
                                    return (
                                        <div
                                            key={shape.id}
                                            onClick={() => handleShapeSelect(shape.id)}
                                            style={{
                                                padding: '4px 8px',
                                                border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                                borderRadius: '4px',
                                                backgroundColor: '#f8f9fa',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                userSelect: 'none',
                                                minWidth: '35px',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                backgroundColor: '#4f8cff',
                                                border: '1px solid #1976d2',
                                                borderRadius: '2px',
                                                margin: '0 auto 2px auto',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                ■
                                            </div>
                                            <span style={{
                                                fontSize: '8px',
                                                fontWeight: 'bold',
                                                color: isSelected ? '#4f8cff' : '#333'
                                            }}>
                                                {shape.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* 右邊：2×2 三角形網格 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {/* 上排：左上、右上 */}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {shapeTypes.slice(1, 3).map(shape => {
                                        const isSelected = selectedShape === shape.id;
                                        return (
                                            <div
                                                key={shape.id}
                                                onClick={() => handleShapeSelect(shape.id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                                    borderRadius: '4px',
                                                    backgroundColor: '#f8f9fa',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    userSelect: 'none',
                                                    minWidth: '35px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: '#4f8cff',
                                                    border: '1px solid #1976d2',
                                                    borderRadius: '0',
                                                    margin: '0 auto 2px auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '8px',
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}>
                                                    {shape.type === 'up-left' ? '◢' : '◣'}
                                                </div>
                                                <span style={{
                                                    fontSize: '8px',
                                                    fontWeight: 'bold',
                                                    color: isSelected ? '#4f8cff' : '#333'
                                                }}>
                                                    {shape.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {/* 下排：左下、右下 */}
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {shapeTypes.slice(3, 5).map(shape => {
                                        const isSelected = selectedShape === shape.id;
                                        return (
                                            <div
                                                key={shape.id}
                                                onClick={() => handleShapeSelect(shape.id)}
                                                style={{
                                                    padding: '4px 8px',
                                                    border: `2px solid ${isSelected ? '#4f8cff' : '#ccc'}`,
                                                    borderRadius: '4px',
                                                    backgroundColor: '#f8f9fa',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    userSelect: 'none',
                                                    minWidth: '35px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: '#4f8cff',
                                                    border: '1px solid #1976d2',
                                                    borderRadius: '0',
                                                    margin: '0 auto 2px auto',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '8px',
                                                    fontWeight: 'bold',
                                                    color: 'white'
                                                }}>
                                                    {shape.type === 'down-left' ? '◥' : '◤'}
                                                </div>
                                                <span style={{
                                                    fontSize: '8px',
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
                        </div>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                            onClick={clearGrid}
                            style={{
                                padding: '4px 8px',
                                backgroundColor: '#ffc107',
                                color: '#000',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            清空網格
                        </button>
                    </div>
                </div>
            )}

            {/* 位置選擇器 */}
            <PositionSelector
                isOpen={showPositionSelector}
                onClose={() => setShowPositionSelector(false)}
                onConfirm={onPositionConfirm}
                gameData={gameData}
            />

            {/* 放射選擇器 */}
            <RadiateSelector
                isOpen={showRadiateSelector}
                onClose={() => setShowRadiateSelector(false)}
                onConfirm={onRadiateConfirm}
                gameData={gameData}
            />
        </div>
    );
}

export default MinaRoom;
