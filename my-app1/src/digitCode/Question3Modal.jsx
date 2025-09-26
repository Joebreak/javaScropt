import React, { useState } from "react";
import { getApiUrl } from '../config/api';

export default function Question3Modal({ isOpen, onClose, onSubmit, gameData }) {
  const [selectedDigit, setSelectedDigit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 解析遊戲答案數據
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

  // 數字位置選擇選項
  const digitPositions = [
    { value: "T", label: "T (第1個數字)", position: 1 },
    { value: "U", label: "U (第2個數字)", position: 2 },
    { value: "V", label: "V (第3個數字)", position: 3 },
    { value: "W", label: "W (第4個數字)", position: 4 },
    { value: "X", label: "X (第5個數字)", position: 5 },
    { value: "Y", label: "Y (第6個數字)", position: 6 },
  ];

  // 判斷數字是偶數還是奇數
  const checkEvenOdd = (digit, answerData) => {
    const parsedData = parseGameData(answerData);
    if (!parsedData) return null;

    const value = parsedData[digit];
    return value % 2 === 0 ? "偶數" : "奇數";
  };

  // 處理提交
  const handleSubmit = async () => {
    if (!selectedDigit) {
      alert("請選擇要檢查的數字位置");
      return;
    }

    setIsSubmitting(true);

    try {
      // 找到選擇的位置
      const selectedDigitData = digitPositions.find(pos => pos.value === selectedDigit);

      // 計算偶數/奇數結果
      let evenOddResult = null;
      if (gameData.answerData) {
        evenOddResult = checkEvenOdd(
          selectedDigitData.value,
          gameData.answerData
        );
      }
      console.log('evenOddResult', selectedDigitData);
      // 準備API請求數據 - 參考 Question2Modal 的格式
      const requestBody = {
        room: gameData.room,
        round: gameData.currentRound,
        data: {
          type: 3, // 問題類型3
          result: evenOddResult || "未知",
          in: selectedDigitData.value,
          out: evenOddResult || "未知"
        }
      };

      // 調用API - 參考 Question2Modal 的方式
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
        if (onSubmit) {
          onSubmit({
            needsRefresh: true // 標記需要更新畫面
          });
        }
        // 關閉彈窗
        onClose();
      } else {
        console.error('API 呼叫失敗:', response.status, response.statusText);
        alert('提交失敗，請重試');
      }

    } catch (error) {
      console.error('提交問題3時發生錯誤:', error);
      alert('提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理取消
  const handleCancel = () => {
    setSelectedDigit("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "500px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
      }}>
        {/* 標題 */}
        <h3 style={{
          margin: "0 0 20px 0",
          color: "#333",
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "bold"
        }}>
          問題3: 數字是偶數還是奇數
        </h3>

        {/* 說明文字 */}
        <div style={{
          background: "#f0f8ff",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "14px",
          color: "#666",
          lineHeight: "1.5"
        }}>
          請選擇要檢查的數字位置，系統會告訴您該數字是偶數還是奇數。
        </div>

        {/* 數字位置選擇 */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            marginBottom: "12px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#333"
          }}>
            選擇要檢查的數字位置:
          </label>

          {/* 按鈕選擇區域 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px"
          }}>
            {digitPositions.map(position => (
              <button
                key={position.value}
                onClick={() => setSelectedDigit(position.value)}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  background: selectedDigit === position.value ? "#4CAF50" : "#f0f0f0",
                  color: selectedDigit === position.value ? "white" : "#333",
                  border: selectedDigit === position.value ? "2px solid #4CAF50" : "2px solid #ddd",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textAlign: "left"
                }}
                onMouseOver={(e) => {
                  if (selectedDigit !== position.value) {
                    e.target.style.background = "#e0e0e0";
                    e.target.style.borderColor = "#bbb";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedDigit !== position.value) {
                    e.target.style.background = "#f0f0f0";
                    e.target.style.borderColor = "#ddd";
                  }
                }}
              >
                {position.label}
              </button>
            ))}
          </div>
        </div>

        {/* 按鈕區域 */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "bold",
              background: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
              transition: "all 0.3s ease"
            }}
          >
            取消
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedDigit}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "bold",
              background: isSubmitting || !selectedDigit ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting || !selectedDigit ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {isSubmitting ? "提交中..." : "確認提交"}
          </button>
        </div>

        {/* 選擇預覽 */}
        {selectedDigit && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "#e8f5e8",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#2e7d32",
            textAlign: "center"
          }}>
            將檢查 {selectedDigit} 位置的數字是偶數還是奇數
          </div>
        )}
      </div>
    </div>
  );
}
