import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const ShapeValidator = ({ isOpen, onClose, onConfirm, gameData, roomGridData = null }) => {
    const [isValidating, setIsValidating] = useState(false);

    // 定義顏色選項（用於解析網格數據）
    const colorTypes = [
        { id: 'TYPE1', name: '白色', color: '#ffffff', borderColor: '#ddd' },
        { id: 'TYPE2', name: '紅色', color: '#ff6b6b', borderColor: '#e74c3c' },
        { id: 'TYPE3', name: '藍色', color: '#3F48CC', borderColor: '#3498db' },
        { id: 'TYPE4', name: '黃色', color: '#feca57', borderColor: '#f39c12' },
        { id: 'TYPE5', name: '黑色', color: '#2c3e50', borderColor: '#000000' },
        { id: 'TYPE0', name: '透明', color: 'transparent', borderColor: '#ccc' }
    ];

    // 定義形狀選項（用於解析網格數據）
    const shapeTypes = [
        { id: 'SQUARE', name: '實心', shape: 'square' },
        { id: 'TRIANGLE_UP_LEFT', name: '左上', shape: 'triangle', rotation: 0, type: 'up-left' },
        { id: 'TRIANGLE_UP_RIGHT', name: '右上', shape: 'triangle', rotation: 0, type: 'up-right' },
        { id: 'TRIANGLE_DOWN_LEFT', name: '左下', shape: 'triangle', rotation: 0, type: 'down-left' },
        { id: 'TRIANGLE_DOWN_RIGHT', name: '右下', shape: 'triangle', rotation: 0, type: 'down-right' },
        { id: 'X_SHAPE', name: 'X', shape: 'x', rotation: 0, type: 'x' }
    ];
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
    // 解析形狀信息
    const getShapeInfo = (cellData) => {
        if (!cellData || typeof cellData !== 'object') return null;

        if (cellData.color && cellData.shape) {
            // 如果是 X 圖形，不參與驗證
            if (cellData.shape === 'X_SHAPE' || cellData.shape === 'x') {
                return null;
            }
            
            const color = colorTypes.find(c => c.id === cellData.color);
            const shape = shapeTypes.find(s => s.id === cellData.shape);
            const NOTE4 = shape ? getAngleFromShape(shape.id) : null;
            if (!color || !NOTE4) {
                console.warn('無法找到對應的顏色或形狀:', cellData);
                return null;
            }
            return { NOTE3: color?.id, NOTE4 };
        }
        return null;
    };

    // 驗證網格
    const validateGrid = async () => {
        if (!gameData) {
            console.error('缺少遊戲數據');
            return;
        }
        setIsValidating(true);

        try {
            // 比較當前網格數據與遊戲數據是否匹配
            const expectedMapData = gameData.mapList || [];
            // 直接使用 roomGridData，如果沒有則使用空網格
            const grid = roomGridData || Array(8).fill().map(() => Array(10).fill(null));
            let validationResult = getCheckResult(expectedMapData, grid);

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
            await response.json();
            // API 調用成功後直接關閉視窗
            if (onConfirm) {
                onConfirm({
                    success: true,
                    message: '提交成功！',
                    details: '答案已成功提交'
                });
            }
            onClose();

        } catch (error) {
            console.error('驗證失敗:', error);
            // API 調用失敗時也直接關閉視窗
            if (onConfirm) {
                onConfirm({
                    success: false,
                    message: `提交失敗: ${error.message}`,
                    details: '請檢查數據格式或稍後再試'
                });
            }
            onClose();
        } finally {
            setIsValidating(false);
        }
    };

    const getCheckResult = (expectedMapData, grid) => {
        // 檢查 roomGridData 的每個位置
        for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
            for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
                // 從 roomGridData 獲取該位置的實際數據
                const shapeInfo = getShapeInfo(grid[rowIndex][colIndex]);
                // 在 expectedMapData 中查找該位置的預期數據
                const expectedItem = expectedMapData.find(item =>
                    item && item.NOTE1 === colIndex && item.NOTE2 === rowIndex
                );
                // 如果期望的 NOTE3 是 null，表示該位置應該沒有形狀
                if ((expectedItem === undefined || expectedItem.NOTE3 === null) && shapeInfo) {
                    return {
                        success: false,
                        message: '驗證失敗',
                        details: `位置 (${colIndex}, ${rowIndex}) 應該沒有形狀`,
                    };
                }
                if (expectedItem && expectedItem.NOTE3 !== null) {
                    // 如果期望的 NOTE3 不是 null，表示該位置應該有形狀
                    if (!shapeInfo) {
                        return {
                            success: false,
                            message: '驗證失敗',
                            details: `位置 (${colIndex}, ${rowIndex}) 缺少形狀`,
                        };
                    }
                    if (shapeInfo && shapeInfo.NOTE3 !== expectedItem.NOTE3) {
                        return {
                            success: false,
                            message: '驗證失敗',
                            details: `位置 (${colIndex}, ${rowIndex}) 顏色不匹配`,
                        };
                    }
                    if (shapeInfo && shapeInfo.NOTE4 !== expectedItem.NOTE4) {
                        return {
                            success: false,
                            message: '驗證失敗',
                            details: `位置 (${colIndex}, ${rowIndex}) 角度不匹配`,
                        };
                    }
                }
            }
        }
        return {
            success: true,
            message: '驗證成功！',
            details: '網格配置與預期完全匹配',
        };
    };

    // 處理取消
    const handleCancel = () => {
        setIsValidating(false);
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



                {/* 按鈕區域 */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
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
                </div>
            </div>
        </div>
    );
};

export default ShapeValidator;