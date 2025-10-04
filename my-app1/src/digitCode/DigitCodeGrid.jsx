import React, { useState, useEffect } from "react";
import { ResponsiveDigitDisplay } from "./layouts";
import { ComparisonSymbols } from "./model";

export default function DigitCodeGrid({
  userSelections = [],
  onUserSelection,
  list = [],
  showDigitExample = false
}) {
  const [selectedSegments, setSelectedSegments] = useState({});
  const isMobile = window.innerWidth <= 768;

  // 當 userSelections 改變時更新 selectedSegments
  useEffect(() => {
    setSelectedSegments(userSelections);
  }, [userSelections]);

  // 從 list 中提取 type: 1 的記錄，創建位置到數字的映射
  const getPositionNumbers = () => {
    if (!list || !Array.isArray(list)) return {};
    
    const positionNumbers = {};
    list.forEach(item => {
      if (item.type === 1 && item.in && item.out !== undefined) {
        positionNumbers[item.in] = item.out;
      }
    });
    
    return positionNumbers;
  };

  const positionNumbers = getPositionNumbers();

  // 處理偶數奇數檢查 - 根據 list 中 type = 3 的記錄
  const getEvenOddCheck = (digit) => {
    if (!list || !Array.isArray(list)) return null;

    const evenOddRecord = list.find(item =>
      item.type === 3 &&
      item.in &&
      item.in.toString() === digit
    );

    if (!evenOddRecord) return null;

    const result = evenOddRecord.out;
    if (result.includes('偶數')) return 'even';
    if (result.includes('奇數')) return 'odd';

    return null;
  };

  // 處理相鄰位置比較 - 根據 list 中 type = 2 的記錄
  const getAdjacentComparison = (digit1, digit2) => {
    if (!list || !Array.isArray(list)) return null;

    const comparisonRecord = list.find(item =>
      item.type === 2 &&
      item.in &&
      item.in.includes(digit1) &&
      item.in.includes(digit2)
    );

    if (!comparisonRecord) return null;

    const result = comparisonRecord.out;
    if (result.includes('>')) return '>';
    if (result.includes('<')) return '<';
    if (result.includes('=')) return '=';

    return null;
  };

  // 渲染偶數奇數標記
  const renderEvenOddMark = (type, size = 12) => {
    const iconSize = size;
    const color = "#e74c3c";

    switch (type) {
      case 'even':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 16 16">
            <circle cx="6" cy="8" r="1.5" fill={color} />
            <circle cx="10" cy="8" r="1.5" fill={color} />
          </svg>
        );
      case 'odd':
        return (
          <svg width={iconSize} height={iconSize} viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="1.5" fill={color} />
          </svg>
        );
      default:
        return null;
    }
  };

  // 渲染比較符號圖形
  const renderComparisonIcon = (type, size = 16, isVertical = false) => {
    const iconSize = size;
    const strokeWidth = 2;
    const color = "#e74c3c";

    // 基礎箭頭 SVG
    const getArrowSVG = (path, rotation = 0) => (
      <svg width={iconSize} height={iconSize} viewBox="0 0 16 16" style={{ transform: `rotate(${rotation}deg)` }}>
        <path d={path} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );

    switch (type) {
      case '>':
        if (isVertical) {
          // 垂直時：> 旋轉 90 度變成向下箭頭
          return getArrowSVG("M4 4 L12 8 L4 12", 90);
        } else {
          // 水平時：正常的 > 箭頭
          return getArrowSVG("M4 4 L12 8 L4 12");
        }
      case '<':
        if (isVertical) {
          // 垂直時：< 旋轉 90 度變成向上箭頭
          return getArrowSVG("M12 4 L4 8 L12 12", 90);
        } else {
          // 水平時：正常的 < 箭頭
          return getArrowSVG("M12 4 L4 8 L12 12");
        }
      case '=':
        if (isVertical) {
          // 垂直時：= 旋轉 90 度
          return getArrowSVG("M6 4 L6 12 M10 4 L10 12", 90);
        } else {
          // 水平時：正常的 = 符號
          return getArrowSVG("M4 6 L12 6 M4 10 L12 10");
        }
      default:
        return null;
    }
  };

  // 處理段按鈕點擊 - 支持三種狀態：0(白色), 1(綠色), -1(紅色)
  const handleSegmentClick = (segment) => {
    const currentState = selectedSegments[segment] || 0;
    let newState;

    // 循環：0 -> 1 -> -1 -> 0
    if (currentState === 0) newState = 1;
    else if (currentState === 1) newState = -1;
    else newState = 0;

    const newSelections = { ...selectedSegments, [segment]: newState };
    setSelectedSegments(newSelections);
    if (onUserSelection) onUserSelection(newSelections);
  };

  // 處理數字點擊
  const handleNumberClick = (key, value) => {
    const newSelections = { ...selectedSegments, [key]: value };
    setSelectedSegments(newSelections);
    if (onUserSelection) onUserSelection(newSelections);
  };

  return (
    <div style={{ padding: "0px" }}>
      {/* 0-9 數位顯示範例 - 根據 showDigitExample 控制顯示 */}
      {showDigitExample && (
        <div style={{
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          border: "2px solid #e9ecef"
        }}>
          <h3 style={{
            margin: "0 0 15px 0",
            color: "#495057",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center"
          }}>
            數位顯示範例 (0-9)
          </h3>
          <DigitDisplayGrid />
        </div>
      )}

      {/* 3x2 可點擊數位段網格 */}
      <div style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(2, auto)",
        columnGap: isMobile ? "0px" : "50px",
        rowGap: isMobile ? "30px" : "32px",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: isMobile ? "100%" : "800px",
        margin: "0 auto",
        marginTop: isMobile ? "60px" : "120px"
      }}>
        {/* 數字輸入方框 - A~I (最上方) */}
        <div style={{
          position: "absolute",
          top: isMobile ? "-60px" : "-60px",
          left: isMobile ? "0px" : "-100px",
          right: "0",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          columnGap: isMobile ? "1px" : "1px",
          zIndex: 10,
          pointerEvents: "auto"
        }}>
          {/* A B C 數字輸入框 - 第一列 */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: isMobile ? "1px" : "1px",
            position: "relative"
          }}>
            {['A', 'B', 'C'].map((label) => (
              <div key={label} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px"
              }}>
                <div style={{
                  width: isMobile ? "25px" : "35px",
                  height: isMobile ? "25px" : "35px",
                  backgroundColor: positionNumbers[label] ? "#e8f5e8" : "#ffffff",
                  border: positionNumbers[label] ? "2px solid #28a745" : "2px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "bold",
                  color: positionNumbers[label] ? "#155724" : "#333",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease"
                }}>
                  {positionNumbers[label] || ""}
                </div>
              </div>
            ))}
          </div>
          {/* D E F 數字輸入框 - 第二列 */}
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: isMobile ? "1px" : "1px",
            position: "relative",
            paddingLeft: isMobile ? "10px" : "70px"
          }}>
            {['D', 'E', 'F'].map((label) => (
              <div key={label} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px"
              }}>
                <div style={{
                  width: isMobile ? "25px" : "35px",
                  height: isMobile ? "25px" : "35px",
                  backgroundColor: positionNumbers[label] ? "#e8f5e8" : "#ffffff",
                  border: positionNumbers[label] ? "2px solid #28a745" : "2px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "bold",
                  color: positionNumbers[label] ? "#155724" : "#333",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease"
                }}>
                  {positionNumbers[label] || ""}
                </div>
              </div>
            ))}
          </div>
          {/* G H I 數字輸入框 - 第三列 */}
          <div style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: isMobile ? "1px" : "1px",
            position: "relative",
            paddingLeft: isMobile ? "10px" : "50px"
          }}>
            {['G', 'H', 'I'].map((label) => (
              <div key={label} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px"
              }}>
                <div style={{
                  width: isMobile ? "25px" : "35px",
                  height: isMobile ? "25px" : "35px",
                  backgroundColor: positionNumbers[label] ? "#e8f5e8" : "#ffffff",
                  border: positionNumbers[label] ? "2px solid #28a745" : "2px solid #ddd",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "14px" : "16px",
                  fontWeight: "bold",
                  color: positionNumbers[label] ? "#155724" : "#333",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease"
                }}>
                  {positionNumbers[label] || ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 數字輸入方框 - J~N (左側) */}
        <div style={{
          position: "absolute",
          top: isMobile ? "-15px" : "-20px",
          right: isMobile ? "-20px" : "0px",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "1px" : "1px",
          alignItems: "flex-start",
          textAlign: "left",
          zIndex: 10,
          pointerEvents: "auto"
        }}>
          {['J', 'K', 'L', 'M', 'N'].map((label) => (
            <div key={label} style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "6px"
            }}>
              <div style={{
                width: isMobile ? "22px" : "30px",
                height: isMobile ? "22px" : "30px",
                backgroundColor: positionNumbers[label] ? "#e8f5e8" : "#ffffff",
                border: positionNumbers[label] ? "2px solid #28a745" : "2px solid #ddd",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: "bold",
                color: positionNumbers[label] ? "#155724" : "#333",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease"
              }}>
                {positionNumbers[label] || ""}
              </div>
            </div>
          ))}
        </div>

        {/* 數字輸入方框 - O~S (左側) */}
        <div style={{
          position: "absolute",
          top: isMobile ? "295px" : "160px",
          right: isMobile ? "-10px" : "0px",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "1px" : "1px",
          alignItems: "flex-start",
          textAlign: "left",
          zIndex: 10,
          pointerEvents: "auto"
        }}>
          {['O', 'P', 'Q', 'R', 'S'].map((label) => (
            <div key={label} style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "6px"
            }}>
              <div style={{
                width: isMobile ? "20px" : "30px",
                height: isMobile ? "20px" : "30px",
                backgroundColor: positionNumbers[label] ? "#e8f5e8" : "#ffffff",
                border: positionNumbers[label] ? "2px solid #28a745" : "2px solid #ddd",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "12px" : "14px",
                fontWeight: "bold",
                color: positionNumbers[label] ? "#155724" : "#333",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                transition: "all 0.2s ease"
              }}>
                {positionNumbers[label] || ""}
              </div>
            </div>
          ))}
        </div>


        {[
          { index: 0, label: "T" , topLabels : "A B C", leftLabels : "J K L M N"},
          { index: 1, label: "U" , topLabels : "D E F"},
          { index: 2, label: "V" , topLabels : "G H I"},
          { index: 3, label: "W" , leftLabels : "O P Q R S"},
          { index: 4, label: "X" },
          { index: 5, label: "Y" }
        ].map(({ index, label , topLabels , leftLabels }) => {
          // 檢查偶數奇數
          const evenOddCheck = getEvenOddCheck(label);

          return (
            <ResponsiveDigitDisplay
              key={index}
              digitIndex={index}
              label={label}
              evenOddCheck={evenOddCheck}
              selectedSegments={selectedSegments}
              onSegmentClick={handleSegmentClick}
              onNumberClick={handleNumberClick}
              renderEvenOddMark={renderEvenOddMark}
              renderComparisonIcon={renderComparisonIcon}
              list={list}
              // 傳入標籤數據 - 從配置中取得
              topLabels={topLabels}
              leftLabels={leftLabels}
            />
          );
        })}

        {/* 比較符號 - 使用模組化組件 */}
        {
          [
            { index: 0, label: "T" },
            { index: 1, label: "U" },
            { index: 2, label: "V" },
            { index: 3, label: "W" },
            { index: 4, label: "X" },
            { index: 5, label: "Y" }
          ].map(({ index, label }) => {
            const digitLabels = ["T", "U", "V", "W", "X", "Y"];

            // 檢查相鄰位置的比較
            const rightComparison = index < 2 ? getAdjacentComparison(label, digitLabels[index + 1]) : null; // T-U, U-V
            const bottomComparison = index < 3 ? getAdjacentComparison(label, digitLabels[index + 3]) : null; // T-W, U-X, V-Y (上下關係)
            const rightComparisonBottom = index >= 3 && index < 5 ? getAdjacentComparison(label, digitLabels[index + 1]) : null; // W-X, X-Y

            return (
              <div key={`comparison-${index}`}>
                {/* 右側比較符號 */}
                <ComparisonSymbols
                  rightComparison={rightComparison}
                  rightComparisonBottom={rightComparisonBottom}
                  renderComparisonIcon={renderComparisonIcon}
                  isMobile={isMobile}
                  position="right"
                  columnIndex={index % 3}
                />

                {/* 下方比較符號 */}
                <ComparisonSymbols
                  bottomComparison={bottomComparison}
                  renderComparisonIcon={renderComparisonIcon}
                  isMobile={isMobile}
                  position="bottom"
                  columnIndex={index % 3} // 0,1,2 對應 T/U/V 欄，讓 T-W、U-X、V-Y 分別對齊
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}

// 數位顯示網格組件
function DigitDisplayGrid() {
  const isMobile = window.innerWidth <= 768;
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const size = isMobile ? 20 : 24;

  if (isMobile) {
    // 手機版：分兩行顯示
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
        {/* 第一行：0-4 */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }}>
          {numbers.slice(0, 5).map((number, index) => (
            <DigitDisplay
              key={index}
              number={number}
              size={size}
              showNumber={true}
            />
          ))}
        </div>
        {/* 第二行：5-9 */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px"
        }}>
          {numbers.slice(5, 10).map((number, index) => (
            <DigitDisplay
              key={index + 5}
              number={number}
              size={size}
              showNumber={true}
            />
          ))}
        </div>
      </div>
    );
  } else {
    // 桌面版：單行顯示
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap"
      }}>
        {numbers.map((number, index) => (
          <DigitDisplay
            key={index}
            number={number}
            size={size}
            showNumber={true}
          />
        ))}
      </div>
    );
  }
}

// 單個數位顯示組件 - 使用 Question1Modal 的七段顯示器樣式
function DigitDisplay({ number, size, showNumber = false }) {
  const digitSegments = {
    0: ['a', 'b', 'c', 'd', 'e', 'f'],
    1: ['b', 'c'],
    2: ['a', 'b', 'g', 'e', 'd'],
    3: ['a', 'b', 'g', 'c', 'd'],
    4: ['f', 'g', 'b', 'c'],
    5: ['a', 'f', 'g', 'c', 'd'],
    6: ['a', 'f', 'g', 'e', 'd', 'c'],
    7: ['a', 'b', 'c'],
    8: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
    9: ['a', 'b', 'c', 'd', 'f', 'g']
  };

  const activeSegments = digitSegments[number] || [];
  
  // 根據 size 調整顯示器大小 - 響應式設計
  const isMobile = window.innerWidth <= 768;
  const displayWidth = isMobile ? size * 2 : size * 5; // 手機版更小
  const displayHeight = isMobile ? size * 4 : size * 8.33; // 手機版更小

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        position: 'relative',
        width: displayWidth,
        height: displayHeight,
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        {/* 段 a (頂部) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '8px' : '15px',
          left: isMobile ? '10px' : '20px',
          width: isMobile ? '40px' : '80px',
          height: isMobile ? '4px' : '8px',
          backgroundColor: activeSegments.includes('a') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 b (右上) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '12px' : '25px',
          right: isMobile ? '8px' : '15px',
          width: isMobile ? '4px' : '8px',
          height: isMobile ? '35px' : '70px',
          backgroundColor: activeSegments.includes('b') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 c (右下) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '55px' : '105px',
          right: isMobile ? '8px' : '15px',
          width: isMobile ? '4px' : '8px',
          height: isMobile ? '35px' : '70px',
          backgroundColor: activeSegments.includes('c') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 d (底部) */}
        <div style={{
          position: 'absolute',
          bottom: isMobile ? '8px' : '15px',
          left: isMobile ? '10px' : '20px',
          width: isMobile ? '40px' : '80px',
          height: isMobile ? '4px' : '8px',
          backgroundColor: activeSegments.includes('d') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 e (左下) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '55px' : '105px',
          left: isMobile ? '8px' : '15px',
          width: isMobile ? '4px' : '8px',
          height: isMobile ? '35px' : '70px',
          backgroundColor: activeSegments.includes('e') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 f (左上) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '12px' : '25px',
          left: isMobile ? '8px' : '15px',
          width: isMobile ? '4px' : '8px',
          height: isMobile ? '35px' : '70px',
          backgroundColor: activeSegments.includes('f') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
        
        {/* 段 g (中間) */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '48px' : '95px',
          left: isMobile ? '10px' : '20px',
          width: isMobile ? '40px' : '80px',
          height: isMobile ? '4px' : '8px',
          backgroundColor: activeSegments.includes('g') ? '#00ff00' : '#333',
          borderRadius: isMobile ? '2px' : '4px',
          transition: 'all 0.3s ease'
        }} />
      </div>
      {showNumber && (
        <div style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: size * 0.6,
          fontWeight: "bold",
          color: "#666"
        }}>
          {number}
        </div>
      )}
    </div>
  );
}