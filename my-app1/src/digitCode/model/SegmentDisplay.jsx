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
    if (state === 1) return "#00ff00";
    if (state === -1) return "#e74c3c";
    return "#333"; 
  };

  // 七段顯示器配置 - 響應式設計
  const displayWidth = isMobileView ? 60 : 80; // 手機版更小
  const displayHeight = isMobileView ? 90 : 130; // 手機版更小
  
  // 段的大小配置
  const segmentConfig = {
    horizontalWidth: isMobileView ? 48 : 60, // 橫段寬度
    horizontalHeight: isMobileView ? 5 : 6, // 橫段高度
    verticalWidth: isMobileView ? 4 : 6, // 豎段寬度
    verticalHeight: isMobileView ? 40 : 50, // 豎段高度
    borderRadius: isMobileView ? 2 : 3 // 圓角
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 七段顯示器面板 */}
      <div style={{
        position: 'relative',
        width: displayWidth,
        height: displayHeight,
        backgroundColor: '#1a1a1a',
        borderRadius: '8px',
        padding: isMobileView ? '6px' : '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
      }}>
        {/* 段 a (頂部) */}
        <div 
          onClick={() => onSegmentClick(`a${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '8px' : '10px',
            left: isMobileView ? '10px' : '15px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('a'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 b (右上) */}
        <div 
          onClick={() => onSegmentClick(`b${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '12px' : '16px',
            right: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('b'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 c (右下) */}
        <div 
          onClick={() => onSegmentClick(`c${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '55px' : '70px',
            right: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('c'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 d (底部) */}
        <div 
          onClick={() => onSegmentClick(`d${digitIndex}`)}
          style={{
            position: 'absolute',
            bottom: isMobileView ? '8px' : '10px',
            left: isMobileView ? '10px' : '15px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('d'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 e (左下) */}
        <div 
          onClick={() => onSegmentClick(`e${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '55px' : '70px',
            left: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('e'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 f (左上) */}
        <div 
          onClick={() => onSegmentClick(`f${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '12px' : '16px',
            left: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('f'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
        
        {/* 段 g (中間) */}
        <div 
          onClick={() => onSegmentClick(`g${digitIndex}`)}
          style={{
            position: 'absolute',
            top: isMobileView ? '48px' : '60px',
            left: isMobileView ? '10px' : '15px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('g'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }} 
        />
      </div>

      {/* 偶數奇數標記 - 根據手機/網頁版本和偶數奇數調整位置 */}
      {evenOddCheck && (
        <div style={{
          position: "absolute",
          // 根據偶數奇數和設備類型調整位置
          ...(isMobileView ? {
            // 手機版位置
            ...(evenOddCheck === 'even' ? {
              // 偶數：顯示在 a-g 段下方
              top: "15%",
              left: "50%",
              transform: "translateX(-50%) translateY(8px)",
            } : {
              // 奇數：顯示在 a-g 段上方
              top: "0%",
              left: "50%",
              transform: "translateX(-50%) translateY(95px)",
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
          padding: isMobileView ? "1px 10px" : "2px 4px",
          borderRadius: "3px",
          border: "1px solid #ddd"
        }}>
          {renderEvenOddMark(evenOddCheck, isMobileView ? 18 : 12)}
        </div>
      )}
    </div>
  );
}