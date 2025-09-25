import React from 'react';
import { SegmentDisplay, NumberPanel } from '../model';

// 手機版專用布局組件
export default function MobileLayout({ 
  digitIndex, 
  label, 
  evenOddCheck, 
  selectedSegments, 
  onSegmentClick, 
  onNumberClick, 
  renderEvenOddMark,
  rightComparison,
  rightComparisonBottom,
  bottomComparison,
  renderComparisonIcon,
  isMobileView = true
}) {
  return (
    <div style={{ textAlign: "center", position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* 位置標籤 - T~Y 符號 */}
      <div style={{
        position: "absolute",
        top: -10,
        left: -10,
        fontSize: "12px",
        fontWeight: "bold",
        color: "#666",
        pointerEvents: "none",
        zIndex: 20
      }}>
        {label}
      </div>

      {/* a-g 段顯示 */}
      <div style={{ position: "relative" }}>
        <SegmentDisplay
          digitIndex={digitIndex}
          isMobileView={true}
          evenOddCheck={evenOddCheck}
          selectedSegments={selectedSegments}
          onSegmentClick={onSegmentClick}
          renderEvenOddMark={renderEvenOddMark}
        />
      </div>

      {/* 0-9 數字面板 - 手機版在下方，居中對齊 */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
        <NumberPanel
          digitIndex={digitIndex}
          isMobileView={true}
          selectedSegments={selectedSegments}
          onNumberClick={onNumberClick}
        />
      </div>

    </div>
  );
}
