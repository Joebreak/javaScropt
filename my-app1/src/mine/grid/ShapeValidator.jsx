import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const ShapeValidator = ({ isOpen, onClose, onConfirm, gameData, roomGridData = null }) => {
    // 直接使用 roomGridData，如果沒有則使用空網格
    const grid = roomGridData || Array(8).fill().map(() => Array(10).fill(null));
    const [isValidating, setIsValidating] = useState(false);

    // 驗證結果狀態
    const [validationResult, setValidationResult] = useState(null);

    // 定義顏色選項（用於解析網格數據）
    const colorTypes = [
        { id: 'TYPE1', name: '白色', color: '#ffffff', borderColor: '#ddd' },
        { id: 'TYPE2', name: '紅色', color: '#ff6b6b', borderColor: '#e74c3c' },
        { id: 'TYPE3', name: '藍色', color: '#3F48CC', borderColor: '#3498db' },
        { id: 'TYPE4', name: '黃色', color: '#feca57', borderColor: '#f39c12' },
        { id: 'TYPE5', name: '黑色', color: '#2c3e50', borderColor: '#000000' },
        { id: 'TRANSPARENT', name: '透明', color: 'transparent', borderColor: '#ccc' }
    ];

    // 定義形狀選項（用於解析網格數據）
    const shapeTypes = [
        { id: 'SQUARE', name: '實心', shape: 'square' },
        { id: 'TRIANGLE_UP_LEFT', name: '左上', shape: 'triangle', rotation: 0, type: 'up-left' },
        { id: 'TRIANGLE_UP_RIGHT', name: '右上', shape: 'triangle', rotation: 0, type: 'up-right' },
        { id: 'TRIANGLE_DOWN_LEFT', name: '左下', shape: 'triangle', rotation: 0, type: 'down-left' },
        { id: 'TRIANGLE_DOWN_RIGHT', name: '右下', shape: 'triangle', rotation: 0, type: 'down-right' }
    ];

    // 解析形狀信息
    const getShapeInfo = (cellData) => {
        if (!cellData || typeof cellData !== 'object') return null;

        if (cellData.color && cellData.shape) {
            const color = colorTypes.find(c => c.id === cellData.color);
            const shape = shapeTypes.find(s => s.id === cellData.shape);

            if (!color || !shape) {
                console.warn('無法找到對應的顏色或形狀:', cellData);
                return null;
            }

            return { color, shape };
        }

        console.warn('無法解析的形狀 ID 格式:', cellData);
        return null;
    };

    // 將形狀 ID 轉換為角度（參考 RadiateSelector 的角度系統）
    const getAngleFromShape = (shapeId) => {
        switch (shapeId) {
            case 'TRIANGLE_UP_LEFT': return 2;
            case 'TRIANGLE_UP_RIGHT': return 3;
            case 'TRIANGLE_DOWN_LEFT': return 4;
            case 'TRIANGLE_DOWN_RIGHT': return 5;
            case 'SQUARE': return 1;
            default: return null;
        }
    };

    // 驗證網格
    const validateGrid = async () => {
        if (!gameData) {
            console.error('缺少遊戲數據');
            return;
        }

        console.log('roomGridData:', roomGridData);
        console.log('gameData.mapData:', gameData.mapData);

        setIsValidating(true);
        setValidationResult(null);

        try {
            // 將網格數據轉換為 API 格式
            const currentMapData = [];
            let hasShapes = false;
            
            grid.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    const shapeInfo = getShapeInfo(cell);
                    if (shapeInfo) {
                        hasShapes = true;
                        currentMapData.push({
                            NOTE1: colIndex, // 列
                            NOTE2: rowIndex, // 行
                            NOTE3: shapeInfo.color.id, // 顏色
                            NOTE4: getAngleFromShape(shapeInfo.shape.id)
                        });
                    }
                });
            });
            console.log('currentMapData:', currentMapData);
            // 檢查是否有形狀
            if (!hasShapes) {
                setValidationResult({
                    success: false,
                    message: '驗證失敗',
                    details: '網格中沒有放置任何形狀'
                });
                return;
            }

            // 比較當前網格數據與遊戲數據是否匹配
            const expectedMapData = gameData.mapData || [];
            let validationResult = null;

            // 檢查每個預期的位置 - 遇到第一個不匹配就記錄並停止檢查
            for (const expectedItem of expectedMapData) {
                if (expectedItem && expectedItem.NOTE1 !== undefined && expectedItem.NOTE2 !== undefined) {
                    const currentItem = currentMapData.find(item => 
                        item.NOTE1 === expectedItem.NOTE1 && item.NOTE2 === expectedItem.NOTE2
                    );
                    
                    // 如果期望的 NOTE3 是 null，表示該位置應該沒有形狀
                    if (expectedItem.NOTE3 === null) {
                        if (currentItem) {
                            validationResult = {
                                success: false,
                                message: '驗證失敗',
                                details: `位置 (${expectedItem.NOTE1}, ${expectedItem.NOTE2}) 應該沒有形狀，但實際有 ${currentItem.NOTE3}`,
                                data: { currentMapData, expectedMapData }
                            };
                            break;
                        }
                        // 如果期望是 null 且實際也沒有，則正確，繼續檢查下一個
                    } else {
                        // 如果期望的 NOTE3 不是 null，表示該位置應該有形狀
                        if (!currentItem) {
                            validationResult = {
                                success: false,
                                message: '驗證失敗',
                                details: `位置 (${expectedItem.NOTE1}, ${expectedItem.NOTE2}) 缺少形狀`,
                                data: { currentMapData, expectedMapData }
                            };
                            break;
                        } else if (currentItem.NOTE3 !== expectedItem.NOTE3) {
                            validationResult = {
                                success: false,
                                message: '驗證失敗',
                                details: `位置 (${expectedItem.NOTE1}, ${expectedItem.NOTE2}) 顏色不匹配: 期望 ${expectedItem.NOTE3}, 實際 ${currentItem.NOTE3}`,
                                data: { currentMapData, expectedMapData }
                            };
                            break;
                        } else if (currentItem.NOTE4 !== expectedItem.NOTE4) {
                            validationResult = {
                                success: false,
                                message: '驗證失敗',
                                details: `位置 (${expectedItem.NOTE1}, ${expectedItem.NOTE2}) 角度不匹配: 期望 ${expectedItem.NOTE4}, 實際 ${currentItem.NOTE4}`,
                                data: { currentMapData, expectedMapData }
                            };
                            break;
                        }
                    }
                }
            }

            // 如果前面的檢查都通過，檢查是否有額外的形狀
            if (!validationResult) {
                for (const currentItem of currentMapData) {
                    const expectedItem = expectedMapData.find(item => 
                        item && item.NOTE1 === currentItem.NOTE1 && item.NOTE2 === currentItem.NOTE2
                    );
                    // 如果沒有找到對應的預期項目，或者預期項目的 NOTE3 是 null（表示應該沒有形狀）
                    if (!expectedItem || expectedItem.NOTE3 === null) {
                        validationResult = {
                            success: false,
                            message: '驗證失敗',
                            details: `位置 (${currentItem.NOTE1}, ${currentItem.NOTE2}) 有多餘的形狀`,
                            data: { currentMapData, expectedMapData }
                        };
                        break;
                    }
                }
            }

            // 如果所有檢查都通過，設置成功結果
            if (!validationResult) {
                validationResult = {
                    success: true,
                    message: '驗證成功！',
                    details: '網格配置與預期完全匹配',
                    data: { currentMapData, expectedMapData }
                };
            }

            // 準備 API 請求數據
            const requestBody = {
                room: gameData.room,
                round: gameData.lastRound + 1,
                data: {
                    color: validationResult.success ? '驗證成功' : '驗證失敗',
                    in: '提交答案',
                }
            };

            // 發送 API 請求
            const apiUrl = getApiUrl('cloudflare_room_url');
            const response = await fetch(apiUrl + requestBody.room, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // 設置最終驗證結果
            setValidationResult({
                ...validationResult,
                apiResponse: result
            });

        } catch (error) {
            console.error('驗證失敗:', error);
            setValidationResult({
                success: false,
                message: `驗證失敗: ${error.message}`,
                details: '請檢查數據格式或稍後再試'
            });
        } finally {
            setIsValidating(false);
        }
    };

    // 處理確認
    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(validationResult);
        }
        onClose();
    };

    // 處理取消
    const handleCancel = () => {
        setValidationResult(null);
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
                borderRadius: '8px',
                padding: '20px',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>圖形擺放驗證</h3>
            

                {/* 驗證結果顯示 */}
                {validationResult && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '15px',
                        backgroundColor: validationResult.success ? '#d4edda' : '#f8d7da',
                        border: `1px solid ${validationResult.success ? '#c3e6cb' : '#f5c6cb'}`,
                        borderRadius: '6px',
                        color: validationResult.success ? '#155724' : '#721c24'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {validationResult.success ? '✅ 驗證成功！' : '❌ 驗證失敗'}
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            {validationResult.message || (validationResult.success ? '您的圖形擺放是正確的！' : '請檢查您的圖形擺放')}
                        </div>
                        {validationResult.details && (
                            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                                {validationResult.details}
                            </div>
                        )}
                    </div>
                )}

                {/* 按鈕區域 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {!validationResult ? (
                        <>
                            <button
                                onClick={validateGrid}
                                disabled={isValidating}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isValidating ? '#6c757d' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: isValidating ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isValidating ? '驗證中...' : '開始驗證'}
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                取消
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleConfirm}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}
                            >
                                確認
                            </button>
                            <button
                                onClick={handleCancel}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                關閉
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShapeValidator;