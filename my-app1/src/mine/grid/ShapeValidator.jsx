import React, { useState } from 'react';
import { getApiUrl } from '../../config/api';

const ShapeValidator = ({ isOpen, onClose, onConfirm, gameData, roomGridData = null }) => {
    // 使用 RoomGrid 的資料
    const [grid] = useState(roomGridData || Array(8).fill().map(() => Array(10).fill(null)));
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

    // 驗證網格
    const validateGrid = async () => {
        if (!gameData) {
            console.error('缺少遊戲數據');
            return;
        }

        setIsValidating(true);
        setValidationResult(null);

        try {
            // 將網格數據轉換為 API 格式
            const gridData = grid.map((row, rowIndex) => 
                row.map((cell, colIndex) => {
                    const shapeInfo = getShapeInfo(cell);
                    if (!shapeInfo) return null;

                    return {
                        row: rowIndex,
                        col: colIndex,
                        color: shapeInfo.color.id,
                        shape: shapeInfo.shape.id
                    };
                }).filter(cell => cell !== null)
            ).flat();

            const requestData = {
                room: gameData.room,
                grid: gridData
            };

            console.log('發送驗證請求:', requestData);

            const response = await fetch(`${getApiUrl()}/api/validate-shapes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('驗證結果:', result);

            setValidationResult(result);

        } catch (error) {
            console.error('驗證失敗:', error);
            setValidationResult({
                success: false,
                message: `驗證失敗: ${error.message}`
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