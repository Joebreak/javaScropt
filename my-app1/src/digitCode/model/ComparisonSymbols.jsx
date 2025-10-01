import React from 'react';

// 比較符號組件
export default function ComparisonSymbols({ 
  rightComparison, 
  rightComparisonBottom, 
  bottomComparison, 
  renderComparisonIcon, 
  isMobile = false,
  position = "right", // 新增位置參數：right, bottom
  columnIndex // 0,1,2 對應 T/U/V 欄，用於 bottom 符號水平定位，以及 right 區分 T-U / U-V
}) {
  const size = isMobile ? 20 : 16;
  const bottomOffset = isMobile ? "335px" : "160px";

  // 依裝置與欄位決定水平位置，避免多個垂直符號重疊

  const computedLeft = (() => {
    if (typeof columnIndex !== "number") return isMobile ? "50%" : "50%";
    const mobile = ["13%", "50%", "86%"]; // T, U, V
    const desktop = ["20%", "50%", "80%"];
    const list = isMobile ? mobile : desktop;
    return list[Math.max(0, Math.min(2, columnIndex))];
  })();

  // 右側比較符號（上排 T-U / U-V）：保持相同 Y，以 X 位移區分
  const rightLeftOffset = (() => {
    if (typeof columnIndex !== "number") return isMobile ? "96px" : "-16px";
    // index: 0 -> 第一個（T 或 W）; 1 -> 第二個（U 或 X）
    const mobile = ["95px", "230px"];
    const desktop = ["-16px", "8px"];
    const list = isMobile ? mobile : desktop;
    return list[Math.max(0, Math.min(1, columnIndex))];
  })();

  // 根據位置參數決定渲染哪個符號
  if (position === "right") {
    return (
      <>
        {/* 右側比較符號 - 上排 T-U, U-V */}
        {rightComparison && (
          <div style={{
            position: "absolute",
            left: rightLeftOffset,
            top: "0%",
            transform: "translateY(200%)",
            zIndex: 10,
            opacity: 0.8,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2px",
            borderRadius: "3px"
          }}>
            {renderComparisonIcon(rightComparison, size)}
          </div>
        )}

        {/* 右側比較符號 - 下排 W-X, X-Y */}
        {rightComparisonBottom && (
          <div style={{
            position: "absolute",
            left: rightLeftOffset,
            top: "50%",
            transform: "translateY(200%)",
            zIndex: 10,
            opacity: 0.8,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2px",
            borderRadius: "3px"
          }}>
            {renderComparisonIcon(rightComparisonBottom, size)}
          </div>
        )}
      </>
    );
  }

  if (position === "bottom") {
    return (
      <>
        {/* 下方比較符號 */}
        {bottomComparison && (
          <div style={{
            position: "absolute",
            top: bottomOffset,
            left: computedLeft,
            transform: "translateX(-50%)",
            zIndex: 10,
            opacity: 0.8,
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2px",
            borderRadius: "3px"
          }}>
            {renderComparisonIcon(bottomComparison, size, true)}
          </div>
        )}
      </>
    );
  }

  return null;
}
