import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function AnswerModal({ isOpen, onClose, gameData, onAnswerSubmit }) {
    const [answer, setAnswer] = useState([
        ['', '', ''],
        ['', '', '']
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // 重置答案當模態框打開
    useEffect(() => {
        if (isOpen) {
            setAnswer([
                ['', '', ''],
                ['', '', '']
            ]);
            setError('');
        }
    }, [isOpen]);

    // 處理數字選擇
    const handleNumberSelect = (row, col, value) => {
        const newAnswer = [...answer];
        newAnswer[row][col] = value;
        setAnswer(newAnswer);
        setError('');
        // 關閉所有選擇器
        closeAllSelectors();
    };

    // 關閉所有數字選擇器
    const closeAllSelectors = () => {
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
                const modal = document.getElementById(`number-selector-${row}-${col}`);
                if (modal) {
                    modal.style.display = 'none';
                }
            }
        }
    };

    // 清除單個格子
    const clearCell = (row, col) => {
        const newAnswer = [...answer];
        newAnswer[row][col] = '';
        setAnswer(newAnswer);
        setError('');
        closeAllSelectors();
    };

    // 檢查答案是否完整
    const isAnswerComplete = () => {
        return answer.every(row => row.every(cell => cell !== ''));
    };

    // 格式化答案為字符串
    const formatAnswer = () => {
        return answer.map(row => row.join('')).join('');
    };

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

    // 驗證答案是否正確
    const validateAnswer = () => {
        if (!gameData?.answerData) return false;

        const parsedData = parseGameData(gameData.answerData);
        if (!parsedData) return false;

        // 將用戶答案轉換為數字數組
        const userAnswer = answer.flat();
        const correctAnswer = [
            parsedData.T,
            parsedData.U,
            parsedData.V,
            parsedData.W,
            parsedData.X,
            parsedData.Y
        ];

        // 比較答案
        return userAnswer.every((digit, index) =>
            digit === correctAnswer[index]?.toString()
        );
    };

    // 提交答案
    const handleSubmit = async () => {
        if (!isAnswerComplete()) {
            setError('請填寫所有數字');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formattedAnswer = formatAnswer();
            const isCorrect = validateAnswer();

            // 準備API請求數據 - 參考 Question1Modal
            const requestBody = {
                room: gameData.room,
                round: gameData.currentRound,
                data: {
                    type: 5, // 答案提交類型
                    input: formattedAnswer,
                    out: isCorrect ? '正確' : '錯誤'
                }
            };

            // 調用API - 參考 Question1Modal
            const apiUrl = getApiUrl('cloudflare_room_url');
            const response = await fetch(apiUrl + requestBody.room, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('提交失敗');
            }
            if (onAnswerSubmit) {
                onAnswerSubmit({
                    isCorrect: isCorrect,
                    userAnswer: formattedAnswer,
                    needsRefresh: true
                });
            }

            // 關閉模態框
            onClose();

        } catch (err) {
            setError('提交失敗，請重試');
            console.error('提交答案失敗:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
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
            }}
            onClick={closeAllSelectors}
        >
            <div
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '90%',
                    maxWidth: '400px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{
                    margin: '0 0 20px 0',
                    textAlign: 'center',
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: 'bold'
                }}>
                    🎯 提交答案
                </h2>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{
                        margin: '0 0 16px 0',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '14px'
                    }}>
                        請選擇 3×2 的數字答案<br />
                        <span style={{ fontSize: '12px', color: '#999' }}>
                            點擊空白格子選擇數字，點擊有數字的格子清除
                        </span>
                    </p>

                    {/* 答案選擇網格 */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        alignItems: 'center'
                    }}>
                        {answer.map((row, rowIndex) => (
                            <div key={rowIndex} style={{
                                display: 'flex',
                                gap: '8px'
                            }}>
                                {row.map((cell, colIndex) => (
                                    <div key={`${rowIndex}-${colIndex}`} style={{
                                        width: '60px',
                                        height: '60px',
                                        border: '2px solid #ddd',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: cell ? '#333' : '#999',
                                        backgroundColor: cell ? '#f8f9fa' : '#fff',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onClick={() => {
                                            // 如果已經有數字，右鍵清除；左鍵顯示選擇器
                                            if (cell) {
                                                clearCell(rowIndex, colIndex);
                                            } else {
                                                // 先關閉其他選擇器
                                                closeAllSelectors();
                                                // 顯示當前選擇器
                                                const modal = document.getElementById(`number-selector-${rowIndex}-${colIndex}`);
                                                if (modal) {
                                                    modal.style.display = 'block';
                                                }
                                            }
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.borderColor = '#4f8cff';
                                            e.target.style.backgroundColor = '#f0f8ff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.borderColor = '#ddd';
                                            e.target.style.backgroundColor = cell ? '#f8f9fa' : '#fff';
                                        }}
                                    >
                                        {cell || '?'}

                                        {/* 數字選擇器 */}
                                        <div id={`number-selector-${rowIndex}-${colIndex}`} style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'none',
                                            backgroundColor: 'white',
                                            border: '2px solid #4f8cff',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            zIndex: 1000,
                                            marginTop: '4px'
                                        }}>
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(5, 1fr)',
                                                gap: '4px'
                                            }}>
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNumberSelect(rowIndex, colIndex, num.toString());
                                                            const modal = document.getElementById(`number-selector-${rowIndex}-${colIndex}`);
                                                            if (modal) {
                                                                modal.style.display = 'none';
                                                            }
                                                        }}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            backgroundColor: '#fff',
                                                            fontSize: '16px',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.target.style.backgroundColor = '#4f8cff';
                                                            e.target.style.color = 'white';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.target.style.backgroundColor = '#fff';
                                                            e.target.style.color = '#333';
                                                        }}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 錯誤訊息 */}
                {error && (
                    <div style={{
                        color: '#e74c3c',
                        textAlign: 'center',
                        marginBottom: '16px',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {/* 按鈕區域 */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            background: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = '#5a6268';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = '#6c757d';
                        }}
                    >
                        取消
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!isAnswerComplete() || isSubmitting}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            background: isAnswerComplete() && !isSubmitting ? '#28a745' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isAnswerComplete() && !isSubmitting ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            if (isAnswerComplete() && !isSubmitting) {
                                e.target.style.background = '#218838';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (isAnswerComplete() && !isSubmitting) {
                                e.target.style.background = '#28a745';
                            }
                        }}
                    >
                        {isSubmitting ? '提交中...' : '提交答案'}
                    </button>
                </div>
            </div>
        </div>
    );
}
