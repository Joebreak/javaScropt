import React from 'react';

// 比較符號組件
export default function ComparisonSymbols({ 
  rightComparison, 
  rightComparisonBottom, 
  bottomComparison, 
  renderComparisonIcon, 
  isMobile = false,
  position = "right", // 新增位置參數：right, bottom
  columnIndex // 0,1,2 對應 T/U/V 欄，用於 bottom 符號水平定位
}) {
  const size = isMobile ? 12 : 16;
  const rightOffset = isMobile ? "-12px" : "-16px";
  const bottomOffset = isMobile ? "-12px" : "160px";

  // 依裝置與欄位決定水平位置，避免多個垂直符號重疊
  const leftPositionsMobile = ["20%", "50%", "80%"]; // T, U, V
  const leftPositionsDesktop = ["20%", "50%", "80%"]; // 可依需要微調
  const computedLeft = (() => {
    if (typeof columnIndex !== "number") return isMobile ? "50%" : "50%";
    const list = isMobile ? leftPositionsMobile : leftPositionsDesktop;
    return list[Math.max(0, Math.min(2, columnIndex))];
  })();

  // 根據位置參數決定渲染哪個符號
  if (position === "right") {
    return (
      <>
        {/* 右側比較符號 - 上排 T-U, U-V */}
        {rightComparison && (
          <div style={{
            position: "absolute",
            right: rightOffset,
            top: "50%",
            transform: "translateY(-50%)",
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
            right: rightOffset,
            top: "50%",
            transform: "translateY(-50%)",
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
            bottom: bottomOffset,
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
