import React, { useState } from "react";
import { getApiUrl } from '../config/api';

export default function Question2Modal({ isOpen, onClose, onSubmit, gameData, list = [] }) {
  const [selectedPair, setSelectedPair] = useState("");
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

  // 相鄰位置的選擇選項
  const adjacentPairs = [
    { value: "T-U", digit1: "T", digit2: "U" },
    { value: "U-V", digit1: "U", digit2: "V" },
    { value: "T-W", digit1: "T", digit2: "W" },
    { value: "U-X", digit1: "U", digit2: "X" },
    { value: "V-Y", digit1: "V", digit2: "Y" },
    { value: "W-X", digit1: "W", digit2: "X" },
    { value: "X-Y", digit1: "X", digit2: "Y" },
  ];

  // 比較兩個數字的大小關係
  const compareDigits = (digit1, digit2, answerData) => {
    const parsedData = parseGameData(answerData);
    if (!parsedData) return null;

    const value1 = parsedData[digit1];
    const value2 = parsedData[digit2];

    if (value1 > value2) {
      return `${digit1} > ${digit2}`;
    } else if (value1 < value2) {
      return `${digit1} < ${digit2}`;
    } else {
      return `${digit1} = ${digit2}`;
    }
  };

  // 檢查哪些選項已經被使用過（type: 2 的記錄）
  const getUsedPairs = () => {
    if (!list || !Array.isArray(list)) return [];

    const usedPairs = [];
    list.forEach(item => {
      if (item.type === 2 && item.in) {
        usedPairs.push(item.in);
      }
    });

    return usedPairs;
  };

  const usedPairs = getUsedPairs();

  // 處理提交
  const handleSubmit = async () => {
    if (!selectedPair) {
      alert("請選擇要比較的相鄰數字位置");
      return;
    }

    setIsSubmitting(true);

    try {
      // 找到選擇的配對
      const selectedPairData = adjacentPairs.find(pair => pair.value === selectedPair);

      // 計算比較結果
      let comparisonResult = null;
      if (gameData.answerData) {
        comparisonResult = compareDigits(
          selectedPairData.digit1,
          selectedPairData.digit2,
          gameData.answerData
        );
      }

      // 準備API請求數據 - 參考 PositionSelector 的格式
      const requestBody = {
        room: gameData.room,
        round: gameData.currentRound,
        data: {
          type: 2,
          in: selectedPairData.digit1 + "-" + selectedPairData.digit2,
          out: comparisonResult
        }
      };

      // 調用API - 參考 PositionSelector 的方式
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
      console.error('提交問題2時發生錯誤:', error);
      alert('提交失敗，請重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 處理取消
  const handleCancel = () => {
    setSelectedPair("");
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
          問題2: 相鄰數字的大小關係
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
          請選擇要比較的相鄰數字位置，系統會告訴您這兩個數字的大小關係。
        </div>

        {/* 相鄰位置選擇 */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            marginBottom: "12px",
            fontSize: "14px",
            fontWeight: "bold",
            color: "#333"
          }}>
            選擇要比較的相鄰數字位置:
          </label>

          {/* 按鈕選擇區域 - 5格佈局比較網格 */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            {/* 第一排：T U V (5格佈局) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: "10px",
              alignItems: "center"
            }}>
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                T
              </div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "T-U");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("T-U")}
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: usedPairs.includes("T-U")
                    ? "#f8d7da"
                    : selectedPair === "T-U"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("T-U")
                    ? "#721c24"
                    : selectedPair === "T-U"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("T-U")
                    ? "2px solid #dc3545"
                    : selectedPair === "T-U"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "6px",
                  cursor: usedPairs.includes("T-U") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("T-U") ? 0.6 : 1
                }}
              >
                T-U
              </button>
              
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                U
              </div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "U-V");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("U-V")}
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: usedPairs.includes("U-V")
                    ? "#f8d7da"
                    : selectedPair === "U-V"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("U-V")
                    ? "#721c24"
                    : selectedPair === "U-V"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("U-V")
                    ? "2px solid #dc3545"
                    : selectedPair === "U-V"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "6px",
                  cursor: usedPairs.includes("U-V") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("U-V") ? 0.6 : 1
                }}
              >
                U-V
              </button>
              
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                V
              </div>
            </div>

            {/* 中間：T-W, U-X, V-Y 垂直比較 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: "10px",
              alignItems: "center"
            }}>
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "T-W");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("T-W")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  background: usedPairs.includes("T-W")
                    ? "#f8d7da"
                    : selectedPair === "T-W"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("T-W")
                    ? "#721c24"
                    : selectedPair === "T-W"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("T-W")
                    ? "2px solid #dc3545"
                    : selectedPair === "T-W"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "8px",
                  cursor: usedPairs.includes("T-W") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("T-W") ? 0.6 : 1,
                  textAlign: "center"
                }}
              >
                T-W
              </button>
              
              <div></div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "U-X");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("U-X")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  background: usedPairs.includes("U-X")
                    ? "#f8d7da"
                    : selectedPair === "U-X"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("U-X")
                    ? "#721c24"
                    : selectedPair === "U-X"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("U-X")
                    ? "2px solid #dc3545"
                    : selectedPair === "U-X"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "8px",
                  cursor: usedPairs.includes("U-X") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("U-X") ? 0.6 : 1,
                  textAlign: "center"
                }}
              >
                U-X
              </button>
              
              <div></div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "V-Y");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("V-Y")}
                style={{
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  background: usedPairs.includes("V-Y")
                    ? "#f8d7da"
                    : selectedPair === "V-Y"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("V-Y")
                    ? "#721c24"
                    : selectedPair === "V-Y"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("V-Y")
                    ? "2px solid #dc3545"
                    : selectedPair === "V-Y"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "8px",
                  cursor: usedPairs.includes("V-Y") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("V-Y") ? 0.6 : 1,
                  textAlign: "center"
                }}
              >
                V-Y
              </button>
            </div>

            {/* 第二排：W X Y (5格佈局) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: "10px",
              alignItems: "center"
            }}>
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                W
              </div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "W-X");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("W-X")}
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: usedPairs.includes("W-X")
                    ? "#f8d7da"
                    : selectedPair === "W-X"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("W-X")
                    ? "#721c24"
                    : selectedPair === "W-X"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("W-X")
                    ? "2px solid #dc3545"
                    : selectedPair === "W-X"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "6px",
                  cursor: usedPairs.includes("W-X") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("W-X") ? 0.6 : 1
                }}
              >
                W-X
              </button>
              
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                X
              </div>
              
              <button
                onClick={() => {
                  const pair = adjacentPairs.find(p => p.value === "X-Y");
                  if (pair && !usedPairs.includes(pair.value)) {
                    setSelectedPair(pair.value);
                  }
                }}
                disabled={usedPairs.includes("X-Y")}
                style={{
                  padding: "8px 12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  background: usedPairs.includes("X-Y")
                    ? "#f8d7da"
                    : selectedPair === "X-Y"
                      ? "#4CAF50"
                      : "#f0f0f0",
                  color: usedPairs.includes("X-Y")
                    ? "#721c24"
                    : selectedPair === "X-Y"
                      ? "white"
                      : "#333",
                  border: usedPairs.includes("X-Y")
                    ? "2px solid #dc3545"
                    : selectedPair === "X-Y"
                      ? "2px solid #4CAF50"
                      : "2px solid #ddd",
                  borderRadius: "6px",
                  cursor: usedPairs.includes("X-Y") ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: usedPairs.includes("X-Y") ? 0.6 : 1
                }}
              >
                X-Y
              </button>
              
              <div style={{
                padding: "12px",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                background: "#f8f9fa",
                borderRadius: "8px"
              }}>
                Y
              </div>
            </div>

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
            disabled={isSubmitting || !selectedPair}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "bold",
              background: isSubmitting || !selectedPair ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSubmitting || !selectedPair ? "not-allowed" : "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {isSubmitting ? "提交中..." : "確認提交"}
          </button>
        </div>

        {/* 選擇預覽 */}
        {selectedPair && (
          <div style={{
            marginTop: "16px",
            padding: "12px",
            background: "#e8f5e8",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#2e7d32",
            textAlign: "center"
          }}>
            將比較 {selectedPair} 的大小關係
          </div>
        )}
      </div>
    </div>
  );
}
