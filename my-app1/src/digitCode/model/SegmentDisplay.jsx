import React from 'react';

// a-g 段顯示組件
export default function SegmentDisplay({ digitIndex, isMobileView, evenOddCheck, selectedSegments, onSegmentClick, renderEvenOddMark }) {
  // 獲取段狀態的函數
  const getSegmentState = (segment) => {
    return selectedSegments[`${segment}${digitIndex}`] || 0;
  };

  // 獲取段顏色的函數
  const getSegmentColor = (segment) => {
    const state = getSegmentState(segment);
    if (state === 1) return "#27ae60"; // 綠色 - 已標記
    if (state === -1) return "#e74c3c"; // 紅色 - 一定不是
    return "#ffffff"; // 深灰色 - 未標記（更清楚可見）
  };

  // 段配置
  const config = {
    width: isMobileView ? 40 : 60,
    height: isMobileView ? 60 : 90,
    strokeWidth: isMobileView ? 2 : 3
  };

  // 段路徑定義
  const segmentPaths = {
    a: { x: config.width * 0.1, y: config.height * 0.05, width: config.width * 0.8, height: config.height * 0.1 },
    b: { x: config.width * 0.85, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
    c: { x: config.width * 0.85, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
    d: { x: config.width * 0.1, y: config.height * 0.9, width: config.width * 0.8, height: config.height * 0.1 },
    e: { x: config.width * 0.05, y: config.height * 0.55, width: config.width * 0.1, height: config.height * 0.4 },
    f: { x: config.width * 0.05, y: config.height * 0.1, width: config.width * 0.1, height: config.height * 0.4 },
    g: { x: config.width * 0.1, y: config.height * 0.45, width: config.width * 0.8, height: config.height * 0.1 }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* a-g 段 SVG */}
      <svg
        width={config.width}
        height={config.height}
        style={{ cursor: "pointer" }}
      >
        {/* 段 a */}
        <path
          d={`M${segmentPaths.a.x} ${segmentPaths.a.y} L${segmentPaths.a.x + segmentPaths.a.width} ${segmentPaths.a.y} L${segmentPaths.a.x + segmentPaths.a.width - 5} ${segmentPaths.a.y + segmentPaths.a.height} L${segmentPaths.a.x + 5} ${segmentPaths.a.y + segmentPaths.a.height} Z`}
          stroke={getSegmentColor('a')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`a${digitIndex}`)}
        />
        {/* 段 b */}
        <path
          d={`M${segmentPaths.b.x} ${segmentPaths.b.y} L${segmentPaths.b.x + segmentPaths.b.width} ${segmentPaths.b.y} L${segmentPaths.b.x + segmentPaths.b.width} ${segmentPaths.b.y + segmentPaths.b.height} L${segmentPaths.b.x} ${segmentPaths.b.y + segmentPaths.b.height - 5} Z`}
          stroke={getSegmentColor('b')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`b${digitIndex}`)}
        />
        {/* 段 c */}
        <path
          d={`M${segmentPaths.c.x} ${segmentPaths.c.y} L${segmentPaths.c.x + segmentPaths.c.width} ${segmentPaths.c.y} L${segmentPaths.c.x + segmentPaths.c.width} ${segmentPaths.c.y + segmentPaths.c.height} L${segmentPaths.c.x} ${segmentPaths.c.y + segmentPaths.c.height - 5} Z`}
          stroke={getSegmentColor('c')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`c${digitIndex}`)}
        />
        {/* 段 d */}
        <path
          d={`M${segmentPaths.d.x} ${segmentPaths.d.y} L${segmentPaths.d.x + segmentPaths.d.width} ${segmentPaths.d.y} L${segmentPaths.d.x + segmentPaths.d.width - 5} ${segmentPaths.d.y + segmentPaths.d.height} L${segmentPaths.d.x + 5} ${segmentPaths.d.y + segmentPaths.d.height} Z`}
          stroke={getSegmentColor('d')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`d${digitIndex}`)}
        />
        {/* 段 e */}
        <path
          d={`M${segmentPaths.e.x} ${segmentPaths.e.y} L${segmentPaths.e.x + segmentPaths.e.width} ${segmentPaths.e.y} L${segmentPaths.e.x + segmentPaths.e.width} ${segmentPaths.e.y + segmentPaths.e.height - 5} L${segmentPaths.e.x} ${segmentPaths.e.y + segmentPaths.e.height} Z`}
          stroke={getSegmentColor('e')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`e${digitIndex}`)}
        />
        {/* 段 f */}
        <path
          d={`M${segmentPaths.f.x} ${segmentPaths.f.y} L${segmentPaths.f.x + segmentPaths.f.width} ${segmentPaths.f.y} L${segmentPaths.f.x + segmentPaths.f.width} ${segmentPaths.f.y + segmentPaths.f.height - 5} L${segmentPaths.f.x} ${segmentPaths.f.y + segmentPaths.f.height} Z`}
          stroke={getSegmentColor('f')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`f${digitIndex}`)}
        />
        {/* 段 g */}
        <path
          d={`M${segmentPaths.g.x} ${segmentPaths.g.y} L${segmentPaths.g.x + segmentPaths.g.width} ${segmentPaths.g.y} L${segmentPaths.g.x + segmentPaths.g.width - 5} ${segmentPaths.g.y + segmentPaths.g.height} L${segmentPaths.g.x + 5} ${segmentPaths.g.y + segmentPaths.g.height} Z`}
          stroke={getSegmentColor('g')}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          fill="none"
          onClick={() => onSegmentClick(`g${digitIndex}`)}
        />
      </svg>

      {/* 偶數奇數標記 - 根據手機/網頁版本和偶數奇數調整位置 */}
      {evenOddCheck && (
        <div style={{
          position: "absolute",
          // 根據偶數奇數和設備類型調整位置
          ...(isMobileView ? {
            // 手機版位置
            ...(evenOddCheck === 'even' ? {
              // 偶數：顯示在 a-g 段下方
              top: "10%",
              left: "50%",
              transform: "translateX(-50%) translateY(4px)",
            } : {
              // 奇數：顯示在 a-g 段上方
              top: "0%",
              left: "50%",
              transform: "translateX(-50%) translateY(-4px)",
            })
          } : {
            // 網頁版位置
            ...(evenOddCheck === 'even' ? {
              // 偶數：顯示在 a-g 段右側
              top: "30%",
              left: "20%",
              transform: "translateX(8px) translateY(-50%)",
            } : {
              // 奇數：顯示在 a-g 段左側
              top: "70%",
              left: "40%",
              transform: "translateX(-8px) translateY(-50%)",
            })
          }),
          zIndex: 5,
          background: "rgba(255, 255, 255, 0.9)",
          padding: isMobileView ? "1px 3px" : "2px 4px",
          borderRadius: "3px",
          border: "1px solid #ddd"
        }}>
          {renderEvenOddMark(evenOddCheck, isMobileView ? 10 : 12)}
        </div>
      )}
    </div>
  );
}