import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function AnswerModal({ isOpen, onClose, gameData, onAnswerSubmit }) {
    const [answer, setAnswer] = useState([
        ['0', '0', '0'],
        ['0', '0', '0']
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 重置答案當模態框打開
    useEffect(() => {
        if (isOpen) {
            setAnswer([
                ['0', '0', '0'],
                ['0', '0', '0']
            ]);
        }
    }, [isOpen]);

    // 處理數字選擇
    const handleNumberSelect = (row, col, value) => {
        const newAnswer = [...answer];
        newAnswer[row][col] = value;
        setAnswer(newAnswer);
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
            return;
        }

        setIsSubmitting(true);

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
            onClick={onClose}
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
                                    <select
                                        key={`${rowIndex}-${colIndex}`}
                                        value={cell || '0'}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleNumberSelect(rowIndex, colIndex, value);
                                        }}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            border: '2px solid #ddd',
                                            borderRadius: '0px', // 方形
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            color: '#333',
                                            backgroundColor: '#f8f9fa',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textAlign: 'center',
                                            appearance: 'none', // 移除預設樣式
                                            WebkitAppearance: 'none', // Safari
                                            MozAppearance: 'none', // Firefox
                                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 8px center',
                                            backgroundSize: '16px',
                                            paddingRight: '24px'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.borderColor = '#4f8cff';
                                            e.target.style.backgroundColor = '#f0f8ff';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.borderColor = '#ddd';
                                            e.target.style.backgroundColor = '#f8f9fa';
                                        }}
                                    >
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                            <option key={num} value={num.toString()}>
                                                {num}
                                            </option>
                                        ))}
                                    </select>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

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
