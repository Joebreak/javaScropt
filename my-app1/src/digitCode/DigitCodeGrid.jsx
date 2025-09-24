import React, { useState, useEffect } from "react";

export default function DigitCodeGrid({ 
  gameData,
  userSelections = [],
  onUserSelection
}) {
  const [selectedSegments, setSelectedSegments] = useState(userSelections);

  // 當 userSelections 改變時更新 selectedSegments
  useEffect(() => {
    setSelectedSegments(userSelections);
  }, [userSelections]);

  // 處理段按鈕點擊 - 支持三種狀態：0(白色), 1(黑色), -1(紅色X)
  const handleSegmentClick = (segment) => {
    const currentState = selectedSegments[segment] || 0;
    let newState;
    
    // 循環切換狀態：0 -> 1 -> -1 -> 0
    if (currentState === 0) {
      newState = 1; // 白色 -> 黑色
    } else if (currentState === 1) {
      newState = -1; // 黑色 -> 紅色X
    } else {
      newState = 0; // 紅色X -> 白色
    }
    
    const newSelections = { ...selectedSegments, [segment]: newState };
    setSelectedSegments(newSelections);
    
    // 通知父組件更新記錄
    if (onUserSelection) {
      onUserSelection(newSelections);
    }
  };

  // 數位顯示的段定義 (a-g)
  const digitSegments = {
    0: { a: true, b: true, c: true, d: true, e: true, f: true, g: false },
    1: { a: false, b: true, c: true, d: false, e: false, f: false, g: false },
    2: { a: true, b: true, c: false, d: true, e: true, f: false, g: true },
    3: { a: true, b: true, c: true, d: true, e: false, f: false, g: true },
    4: { a: false, b: true, c: true, d: false, e: false, f: true, g: true },
    5: { a: true, b: false, c: true, d: true, e: false, f: true, g: true },
    6: { a: true, b: false, c: true, d: true, e: true, f: true, g: true },
    7: { a: true, b: true, c: true, d: false, e: false, f: false, g: false },
    8: { a: true, b: true, c: true, d: true, e: true, f: true, g: true },
    9: { a: true, b: true, c: true, d: true, e: false, f: true, g: true }
  };

  // 單個數位顯示組件
  const DigitDisplay = ({ number, size = "medium", showNumber = true }) => {
    // 尺寸設定
    const sizeConfig = {
      small: { width: 20, height: 35, strokeWidth: 2 },
      medium: { width: 30, height: 50, strokeWidth: 3 },
      large: { width: 40, height: 70, strokeWidth: 4 }
    };

    const config = sizeConfig[size] || sizeConfig.medium;
    const segments = digitSegments[number] || { a: false, b: false, c: false, d: false, e: false, f: false, g: false };

    // SVG 路徑定義
    const segmentPaths = {
      a: `M ${config.width * 0.1} ${config.height * 0.1} L ${config.width * 0.9} ${config.height * 0.1}`,
      b: `M ${config.width * 0.9} ${config.height * 0.1} L ${config.width * 0.9} ${config.height * 0.45}`,
      c: `M ${config.width * 0.9} ${config.height * 0.55} L ${config.width * 0.9} ${config.height * 0.9}`,
      d: `M ${config.width * 0.1} ${config.height * 0.9} L ${config.width * 0.9} ${config.height * 0.9}`,
      e: `M ${config.width * 0.1} ${config.height * 0.55} L ${config.width * 0.1} ${config.height * 0.9}`,
      f: `M ${config.width * 0.1} ${config.height * 0.1} L ${config.width * 0.1} ${config.height * 0.45}`,
      g: `M ${config.width * 0.1} ${config.height * 0.5} L ${config.width * 0.9} ${config.height * 0.5}`
    };

    return (
      <div style={{ 
        display: "inline-block", 
        position: "relative",
        margin: "2px"
      }}>
        <svg 
          width={config.width} 
          height={config.height} 
          viewBox={`0 0 ${config.width} ${config.height}`}
          style={{ 
            background: "#000", 
            borderRadius: "4px",
            padding: "2px"
          }}
        >
          {/* 段 a */}
          <path
            d={segmentPaths.a}
            stroke={segments.a ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 b */}
          <path
            d={segmentPaths.b}
            stroke={segments.b ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 c */}
          <path
            d={segmentPaths.c}
            stroke={segments.c ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 d */}
          <path
            d={segmentPaths.d}
            stroke={segments.d ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 e */}
          <path
            d={segmentPaths.e}
            stroke={segments.e ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 f */}
          <path
            d={segmentPaths.f}
            stroke={segments.f ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* 段 g */}
          <path
            d={segmentPaths.g}
            stroke={segments.g ? "#00ff00" : "#333"}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        
        {/* 顯示數字 */}
        {showNumber && (
          <div style={{
            position: "absolute",
            bottom: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "10px",
            color: "#666",
            fontWeight: "bold",
            textAlign: "center",
            width: "100%"
          }}>
            {number}
          </div>
        )}
      </div>
    );
  };

  // 數位顯示網格組件
  const DigitDisplayGrid = ({ numbers, size = "medium", showNumbers = true }) => {
    // 檢測是否為手機模式
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && numbers.length === 10) {
      // 手機模式下分成兩行：0-4 和 5-9
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "8px",
          margin: "10px 0"
        }}>
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
                showNumber={showNumbers}
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
                showNumber={showNumbers}
              />
            ))}
          </div>
        </div>
      );
    }
    
    // 桌面模式：單行顯示
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        padding: "10px",
        background: "#f0f0f0",
        borderRadius: "8px",
        margin: "10px 0"
      }}>
        {numbers.map((number, index) => (
          <DigitDisplay 
            key={index} 
            number={number} 
            size={size} 
            showNumber={showNumbers}
          />
        ))}
      </div>
    );
  };

  // 渲染可點擊的數位段顯示器 (6個數位段，3×2排列)
  const renderClickableDigitDisplay = () => {
    // 尺寸設定 - 加大尺寸方便用戶操作
    const sizeConfig = {
      large: { width: 60, height: 100, strokeWidth: 5 }
    };
    const config = sizeConfig.large;

    // SVG 路徑定義
    const segmentPaths = {
      a: `M ${config.width * 0.1} ${config.height * 0.1} L ${config.width * 0.9} ${config.height * 0.1}`,
      b: `M ${config.width * 0.9} ${config.height * 0.1} L ${config.width * 0.9} ${config.height * 0.45}`,
      c: `M ${config.width * 0.9} ${config.height * 0.55} L ${config.width * 0.9} ${config.height * 0.9}`,
      d: `M ${config.width * 0.1} ${config.height * 0.9} L ${config.width * 0.9} ${config.height * 0.9}`,
      e: `M ${config.width * 0.1} ${config.height * 0.55} L ${config.width * 0.1} ${config.height * 0.9}`,
      f: `M ${config.width * 0.1} ${config.height * 0.1} L ${config.width * 0.1} ${config.height * 0.45}`,
      g: `M ${config.width * 0.1} ${config.height * 0.5} L ${config.width * 0.9} ${config.height * 0.5}`
    };

    // 段的可點擊區域定義
    const segmentClickAreas = {
      a: { x: config.width * 0.1, y: config.height * 0.05, width: config.width * 0.8, height: config.height * 0.1 },
      b: { x: config.width * 0.85, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
      c: { x: config.width * 0.85, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
      d: { x: config.width * 0.1, y: config.height * 0.85, width: config.width * 0.8, height: config.height * 0.1 },
      e: { x: config.width * 0.05, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
      f: { x: config.width * 0.05, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
      g: { x: config.width * 0.1, y: config.height * 0.45, width: config.width * 0.8, height: config.height * 0.1 }
    };

    // 單個數位段顯示器
    const SingleDigitDisplay = ({ digitIndex, label }) => {
      // 獲取段狀態的函數
      const getSegmentState = (segment) => {
        return selectedSegments[`${segment}${digitIndex}`] || 0;
      };

      // 獲取數字狀態 (0: 無標記, -1: X)
      const getNumState = (num) => {
        return selectedSegments[`num${digitIndex}-${num}`] || 0;
      };

      // 切換數字狀態 (0 <-> -1)
      const handleNumClick = (num) => {
        const key = `num${digitIndex}-${num}`;
        const current = selectedSegments[key] || 0;
        const next = current === -1 ? 0 : -1;
        const newSelections = { ...selectedSegments, [key]: next };
        setSelectedSegments(newSelections);
        if (onUserSelection) onUserSelection(newSelections);
      };

      // 獲取段顏色的函數
      const getSegmentColor = (segment) => {
        const state = getSegmentState(segment);
        if (state === 1) return "#27ae60"; // 綠色 - 已標記
        if (state === -1) return "#e74c3c"; // 紅色 - 一定不是
        return "#ecf0f1"; // 淺灰色 - 未標記
      };

      return (
        <div style={{ position: "relative", display: "inline-block" }}>
          {/* 左上角位置標籤 */}
          {label && (
            <div
              style={{
                position: "absolute",
                top: -8,
                left: -8,
                background: "rgba(0,0,0,0.7)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 6px",
                borderRadius: 6,
                zIndex: 20,
                pointerEvents: "none"
              }}
            >
              {label}
            </div>
          )}

          <svg 
            width={config.width} 
            height={config.height} 
            viewBox={`0 0 ${config.width} ${config.height}`}
            style={{ 
              background: "#000", 
              borderRadius: "4px",
              padding: "2px"
            }}
          >
            {/* 段 a */}
            <path
              d={segmentPaths.a}
              stroke={getSegmentColor('a')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 b */}
            <path
              d={segmentPaths.b}
              stroke={getSegmentColor('b')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 c */}
            <path
              d={segmentPaths.c}
              stroke={getSegmentColor('c')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 d */}
            <path
              d={segmentPaths.d}
              stroke={getSegmentColor('d')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 e */}
            <path
              d={segmentPaths.e}
              stroke={getSegmentColor('e')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 f */}
            <path
              d={segmentPaths.f}
              stroke={getSegmentColor('f')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
            {/* 段 g */}
            <path
              d={segmentPaths.g}
              stroke={getSegmentColor('g')}
              strokeWidth={config.strokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* 右側 0~9 標記 (兩排直排：偶數/奇數) */}
          <div style={{
            position: "absolute",
            left: config.width + 8,
            top: 0,
            display: "flex",
            flexDirection: "row",
            gap: 6,
            zIndex: 15
          }}>
            {/* 偶數直排 0,2,4,6,8 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[0,2,4,6,8].map((n) => {
                const st = getNumState(n);
                return (
                  <button
                    key={`col-even-${n}`}
                    onClick={() => handleNumClick(n)}
                    title={`${n}：${st === -1 ? '排除' : '未排除'}`}
                    style={{
                      width: 22,
                      height: 18,
                      borderRadius: 4,
                      border: st === -1 ? "1px solid #e74c3c" : "1px solid #cfd4da",
                      background: st === -1 ? "#fdecea" : "#f8f9fa",
                      color: st === -1 ? "#e74c3c" : "#495057",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    {st === -1 ? 'X' : n}
                  </button>
                );
              })}
            </div>
            {/* 奇數直排 1,3,5,7,9 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[1,3,5,7,9].map((n) => {
                const st = getNumState(n);
                return (
                  <button
                    key={`col-odd-${n}`}
                    onClick={() => handleNumClick(n)}
                    title={`${n}：${st === -1 ? '排除' : '未排除'}`}
                    style={{
                      width: 22,
                      height: 18,
                      borderRadius: 4,
                      border: st === -1 ? "1px solid #e74c3c" : "1px solid #cfd4da",
                      background: st === -1 ? "#fdecea" : "#f8f9fa",
                      color: st === -1 ? "#e74c3c" : "#495057",
                      fontSize: 10,
                      fontWeight: 700,
                      lineHeight: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    {st === -1 ? 'X' : n}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 可點擊的透明區域 */}
          {Object.entries(segmentClickAreas).map(([segment, area]) => (
            <div
              key={`${segment}${digitIndex}`}
              onClick={() => handleSegmentClick(`${segment}${digitIndex}`)}
              style={{
                position: "absolute",
                left: area.x,
                top: area.y,
                width: area.width,
                height: area.height,
                cursor: "pointer",
                background: "transparent",
                zIndex: 10
              }}
              title={`點擊段 ${segment} (當前狀態: ${getSegmentState(segment) === 0 ? '白色' : getSegmentState(segment) === 1 ? '綠色' : '紅色'})`}
            />
          ))}
        </div>
      );
    };

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        margin: "20px 0"
      }}>
        {/* 3×2 網格排列 - TUV / WXY */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          columnGap: 24,
          rowGap: 16,
          padding: "10px",
          position: "relative"
        }}>
          {/* 上方的行標記 A~I - 對齊到網格 */}
          <div style={{
            position: "absolute",
            top: "-25px",
            left: "10px",
            right: "10px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            fontSize: "10px",
            color: "#666",
            fontWeight: "bold"
          }}>
            <span style={{ textAlign: "center" }}>A B C</span>
            <span style={{ textAlign: "center" }}>D E F</span>
            <span style={{ textAlign: "center" }}>G H I</span>
          </div>
          
          {/* 左側的列標記 J~S - 對齊到網格 */}
          <div style={{
            position: "absolute",
            left: "-25px",
            top: "10px", // 對齊到網格上邊距
            bottom: "10px", // 對齡到網格下邊距
            display: "grid",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "10px",
            fontSize: "10px",
            color: "#666",
            fontWeight: "bold"
          }}>
            {["J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"].map((col, i) => (
              <span key={i} style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                height: "100%"
              }}>{col}</span>
            ))}
          </div>
          
          {[
            { index: 0, label: "T" },
            { index: 1, label: "U" },
            { index: 2, label: "V" },
            { index: 3, label: "W" },
            { index: 4, label: "X" },
            { index: 5, label: "Y" }
          ].map(({ index, label }) => (
            <div key={index} style={{ textAlign: "center", position: "relative", paddingRight: 60 }}>
              <SingleDigitDisplay digitIndex={index} label={label} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 數位顯示範例和可點擊數位段 - 合併在一起 */}
      <div style={{
        background: "#fff",
        margin: "0 20px 20px 20px",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        {/* 數位顯示範例 */}
        <h3 style={{ margin: "0 0 15px 0", color: "#333", textAlign: "center" }}>數位顯示範例 (0-9)</h3>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px" }}>
          <DigitDisplayGrid numbers={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} size="medium" showNumbers={true} />
        </div>
        
        {/* 分隔線 */}
        <div style={{
          height: "1px",
          background: "#e0e0e0",
          margin: "20px 0"
        }}></div>
        
        {/* 可點擊的數位段顯示器 */}
        {renderClickableDigitDisplay()}
      </div>


      {/* 數位顯示預覽 */}
      {gameData?.myCode && gameData.myCode.length > 0 && (
        <div style={{
          background: "#fff",
          margin: "0 20px 20px 20px",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h4 style={{ margin: "0 0 15px 0", color: "#333", textAlign: "center" }}>數位顯示預覽</h4>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DigitDisplayGrid 
              numbers={gameData.myCode} 
              size="medium" 
              showNumbers={true} 
            />
          </div>
        </div>
      )}

    </div>
  );
}
