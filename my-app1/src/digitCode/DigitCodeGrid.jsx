import React, { useState, useEffect } from "react";
import { ResponsiveDigitDisplay } from "./layouts";
import { ComparisonSymbols } from "./model";

export default function DigitCodeGrid({
  gameData,
  userSelections = [],
  onUserSelection,
  list = []
}) {
  const [selectedSegments, setSelectedSegments] = useState({});
  const isMobile = window.innerWidth <= 768;

  // 當 userSelections 改變時更新 selectedSegments
  useEffect(() => {
    setSelectedSegments(userSelections);
  }, [userSelections]);

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
    <div style={{ padding: "20px" }}>
      {/* 0-9 數位顯示範例 */}
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

      {/* 3x2 可點擊數位段網格 */}
      <div style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(3, auto)",
        gridTemplateRows: "repeat(2, auto)",
        columnGap: isMobile ? "30px" : "40px",
        rowGap: isMobile ? "12px" : "16px",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: isMobile ? "100%" : "800px",
        margin: "0 auto"
      }}>
        {/* 行標籤 - A~I (上方，對齊到網格行) */}
        {/* A B C - 第一列 */}
        <div style={{
          position: "absolute",
          top: isMobile ? "-15px" : "0px",
          left: isMobile ? "28%" : "25%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: isMobile ? "15px" : "12px",
            fontWeight: "bold",
            color: "#666",
            wordSpacing: isMobile ? "8px" : "10px"
          }}>A B C</span>
        </div>
        {/* D E F - 第二列 */}
        <div style={{
          position: "absolute",
          top: isMobile ? "-15px" : "0px",
          left: isMobile ? "50%" : "46%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666",
            wordSpacing: isMobile ? "8px" : "10px"
          }}>D E F</span>
        </div>
        {/* G H I - 第三列 */}
        <div style={{
          position: "absolute",
          top: isMobile ? "-15px" : "0px",
          left: isMobile ? "72%" : "66%",
          transform: "translateX(-50%)",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666",
            wordSpacing: isMobile ? "8px" : "10px"
          }}>G H I</span>
        </div>

        {/* 列標籤 - J~N (左側，對齊到網格列) */}
        <div style={{
          position: "absolute",
          top: isMobile ? "60px" : "20px",
          left: isMobile ? "0px" : "150px",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "2px" : "5px",
          alignItems: "flex-start",
          textAlign: "left",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>J</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>K</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>L</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>M</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>N</span>
        </div>

        {/* 列標籤 - O~S (左側，對齊到網格列) */}
        <div style={{
          position: "absolute",
          top: isMobile ? "201px" : "174px",
          left: isMobile ? "66px" : "150px",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? "2px" : "5px",
          alignItems: "flex-start",
          textAlign: "left",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>O</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>P</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>Q</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>R</span>
          <span style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: "bold",
            color: "#666"
          }}>S</span>
        </div>

        {[ 
          { index: 0, label: "T" },
          { index: 1, label: "U" },
          { index: 2, label: "V" },
          { index: 3, label: "W" },
          { index: 4, label: "X" },
          { index: 5, label: "Y" }
        ].map(({ index, label }) => {
          const digitLabels = ["T", "U", "V", "W", "X", "Y"];
          const currentDigit = digitLabels[index];

          // 檢查相鄰位置的比較
          const rightComparison = index < 2 ? getAdjacentComparison(currentDigit, digitLabels[index + 1]) : null; // T-U, U-V
          const bottomComparison = index < 3 ? getAdjacentComparison(currentDigit, digitLabels[index + 3]) : null; // T-W, U-X, V-Y (上下關係)
          const rightComparisonBottom = index >= 3 && index < 5 ? getAdjacentComparison(currentDigit, digitLabels[index + 1]) : null; // W-X, X-Y
          
          // 檢查偶數奇數
          const evenOddCheck = getEvenOddCheck(currentDigit);

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
              rightComparison={rightComparison}
              rightComparisonBottom={rightComparisonBottom}
              bottomComparison={bottomComparison}
              renderComparisonIcon={renderComparisonIcon}
            />
          );
        })}

        {/* 比較符號 - 使用模組化組件 */}
        {[
          { index: 0, label: "T" },
          { index: 1, label: "U" },
          { index: 2, label: "V" },
          { index: 3, label: "W" },
          { index: 4, label: "X" },
          { index: 5, label: "Y" }
        ].map(({ index, label }) => {
          const digitLabels = ["T", "U", "V", "W", "X", "Y"];
          const currentDigit = digitLabels[index];

          // 檢查相鄰位置的比較
          const rightComparison = index < 2 ? getAdjacentComparison(currentDigit, digitLabels[index + 1]) : null; // T-U, U-V
          const bottomComparison = index < 3 ? getAdjacentComparison(currentDigit, digitLabels[index + 3]) : null; // T-W, U-X, V-Y (上下關係)
          const rightComparisonBottom = index >= 3 && index < 5 ? getAdjacentComparison(currentDigit, digitLabels[index + 1]) : null; // W-X, X-Y

          return (
            <div key={`comparison-${index}`}>
              {/* 右側比較符號 */}
              <ComparisonSymbols
                rightComparison={rightComparison}
                rightComparisonBottom={rightComparisonBottom}
                renderComparisonIcon={renderComparisonIcon}
                isMobile={isMobile}
                position="right"
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
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
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

// 單個數位顯示組件
function DigitDisplay({ number, size = 24, showNumber = false }) {
  const config = {
    width: size * 2.5,
    height: size * 4,
    strokeWidth: size * 0.1
  };

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

  const segmentPaths = {
    a: { x: config.width * 0.1, y: config.height * 0.05, width: config.width * 0.8, height: config.height * 0.1 },
    b: { x: config.width * 0.85, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
    c: { x: config.width * 0.85, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
    d: { x: config.width * 0.1, y: config.height * 0.9, width: config.width * 0.8, height: config.height * 0.1 },
    e: { x: config.width * 0.05, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
    f: { x: config.width * 0.05, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
    g: { x: config.width * 0.1, y: config.height * 0.45, width: config.width * 0.8, height: config.height * 0.1 }
  };

  const activeSegments = digitSegments[number] || [];

  // 獲取段的顏色和填充
  const getSegmentColor = (segment) => {
    return activeSegments.includes(segment) ? "#2c3e50" : "#bdc3c7";
  };

  const getSegmentFill = (segment) => {
    return activeSegments.includes(segment) ? "#2c3e50" : "#f5f5dc";
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={config.width} height={config.height}>
        {/* 段 a */}
        <path
          d={`M${segmentPaths.a.x} ${segmentPaths.a.y} L${segmentPaths.a.x + segmentPaths.a.width} ${segmentPaths.a.y} L${segmentPaths.a.x + segmentPaths.a.width - 5} ${segmentPaths.a.y + segmentPaths.a.height} L${segmentPaths.a.x + 5} ${segmentPaths.a.y + segmentPaths.a.height} Z`}
          stroke={getSegmentColor('a')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('a')}
        />
        {/* 段 b */}
        <path
          d={`M${segmentPaths.b.x} ${segmentPaths.b.y} L${segmentPaths.b.x + segmentPaths.b.width} ${segmentPaths.b.y} L${segmentPaths.b.x + segmentPaths.b.width} ${segmentPaths.b.y + segmentPaths.b.height} L${segmentPaths.b.x} ${segmentPaths.b.y + segmentPaths.b.height - 5} Z`}
          stroke={getSegmentColor('b')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('b')}
        />
        {/* 段 c */}
        <path
          d={`M${segmentPaths.c.x} ${segmentPaths.c.y} L${segmentPaths.c.x + segmentPaths.c.width} ${segmentPaths.c.y} L${segmentPaths.c.x + segmentPaths.c.width} ${segmentPaths.c.y + segmentPaths.c.height} L${segmentPaths.c.x} ${segmentPaths.c.y + segmentPaths.c.height - 5} Z`}
          stroke={getSegmentColor('c')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('c')}
        />
        {/* 段 d */}
        <path
          d={`M${segmentPaths.d.x} ${segmentPaths.d.y} L${segmentPaths.d.x + segmentPaths.d.width} ${segmentPaths.d.y} L${segmentPaths.d.x + segmentPaths.d.width - 5} ${segmentPaths.d.y + segmentPaths.d.height} L${segmentPaths.d.x + 5} ${segmentPaths.d.y + segmentPaths.d.height} Z`}
          stroke={getSegmentColor('d')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('d')}
        />
        {/* 段 e */}
        <path
          d={`M${segmentPaths.e.x} ${segmentPaths.e.y} L${segmentPaths.e.x + segmentPaths.e.width} ${segmentPaths.e.y} L${segmentPaths.e.x + segmentPaths.e.width} ${segmentPaths.e.y + segmentPaths.e.height - 5} L${segmentPaths.e.x} ${segmentPaths.e.y + segmentPaths.e.height} Z`}
          stroke={getSegmentColor('e')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('e')}
        />
        {/* 段 f */}
        <path
          d={`M${segmentPaths.f.x} ${segmentPaths.f.y} L${segmentPaths.f.x + segmentPaths.f.width} ${segmentPaths.f.y} L${segmentPaths.f.x + segmentPaths.f.width} ${segmentPaths.f.y + segmentPaths.f.height - 5} L${segmentPaths.f.x} ${segmentPaths.f.y + segmentPaths.f.height} Z`}
          stroke={getSegmentColor('f')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('f')}
        />
        {/* 段 g */}
        <path
          d={`M${segmentPaths.g.x} ${segmentPaths.g.y} L${segmentPaths.g.x + segmentPaths.g.width} ${segmentPaths.g.y} L${segmentPaths.g.x + segmentPaths.g.width - 5} ${segmentPaths.g.y + segmentPaths.g.height} L${segmentPaths.g.x + 5} ${segmentPaths.g.y + segmentPaths.g.height} Z`}
          stroke={getSegmentColor('g')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill={getSegmentFill('g')}
        />
      </svg>
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