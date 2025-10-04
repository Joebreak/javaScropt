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
  list = [],
  // 新增標籤相關 props
  topLabels,
  leftLabels,
}) {
  return (
    <div style={{ textAlign: "center", position: "relative", display: "flex", alignItems: "center", gap: "12px" }}>
      {/* 上方標籤 */}
      {topLabels && (
        <div style={{
          position: "absolute",
          top: -20,
          left: "20%",
          transform: "translateX(-50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          <span style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#666",
            wordSpacing: "20px"
          }}>{topLabels}</span>
        </div>
      )}

      {/* 左側標籤 */}
      {leftLabels && (
        <div style={{
          position: "absolute",
          left: -25,
          top: 0,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          alignItems: "flex-start",
          textAlign: "left",
          zIndex: 10,
          pointerEvents: "none"
        }}>
          {leftLabels.split(' ').map((label, index) => (
            <span key={index} style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#666"
            }}>{label}</span>
          ))}
        </div>
      )}

      {/* 位置標籤 - T~Y 符號 */}
      <div style={{
        position: "absolute",
        top: -22,
        left: -25,
        fontSize: "20px",
        fontWeight: "bold",
        color: "#0000ff",
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
          list={list}
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
