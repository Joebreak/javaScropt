import React from 'react';
import { SegmentDisplay, NumberPanel } from '../model';

// 網頁版專用布局組件
export default function DesktopLayout({ 
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
  isMobileView = false
}) {
  return (
    <div style={{ textAlign: "center", position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
      {/* 位置標籤 - T~Y 符號 */}
      <div style={{
        position: "absolute",
        top: -10,
        left: -20,
        fontSize: "14px",
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
          isMobileView={false}
          evenOddCheck={evenOddCheck}
          selectedSegments={selectedSegments}
          onSegmentClick={onSegmentClick}
          renderEvenOddMark={renderEvenOddMark}
        />
      </div>

      {/* 0-9 數字面板 - 網頁版在右側 */}
      <div style={{ position: "relative" }}>
        <NumberPanel
          digitIndex={digitIndex}
          isMobileView={false}
          selectedSegments={selectedSegments}
          onNumberClick={onNumberClick}
        />
      </div>

    </div>
  );
}
