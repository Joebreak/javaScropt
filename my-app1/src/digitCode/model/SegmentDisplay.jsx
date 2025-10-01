import React from 'react';

// a-g 段顯示組件
export default function SegmentDisplay({ digitIndex, isMobileView, evenOddCheck, selectedSegments, onSegmentClick, renderEvenOddMark, list = [] }) {
  // 位置對應關係和要檢查的段
  const positionMapping = {
    'A': { digits: ['T', 'W'], segments: ['e', 'f'] },
    'B': { digits: ['T', 'W'], segments: ['a', 'd', 'g'] },
    'C': { digits: ['T', 'W'], segments: ['b', 'c'] },
    'D': { digits: ['U', 'X'], segments: ['e', 'f'] },
    'E': { digits: ['U', 'X'], segments: ['a', 'd', 'g'] },
    'F': { digits: ['U', 'X'], segments: ['b', 'c'] },
    'G': { digits: ['V', 'Y'], segments: ['e', 'f'] },
    'H': { digits: ['V', 'Y'], segments: ['a', 'd', 'g'] },
    'I': { digits: ['V', 'Y'], segments: ['b', 'c'] },
    'J': { digits: ['T', 'U', 'V'], segments: ['a'] },
    'K': { digits: ['T', 'U', 'V'], segments: ['b', 'f'] },
    'L': { digits: ['T', 'U', 'V'], segments: ['g'] },
    'M': { digits: ['T', 'U', 'V'], segments: ['c', 'e'] },
    'N': { digits: ['T', 'U', 'V'], segments: ['d'] },
    'O': { digits: ['W', 'X', 'Y'], segments: ['a'] },
    'P': { digits: ['W', 'X', 'Y'], segments: ['b', 'f'] },
    'Q': { digits: ['W', 'X', 'Y'], segments: ['g'] },
    'R': { digits: ['W', 'X', 'Y'], segments: ['c', 'e'] },
    'S': { digits: ['W', 'X', 'Y'], segments: ['d'] }
  };

  // 數字位置對應
  const digitPositions = ['T', 'U', 'V', 'W', 'X', 'Y'];

  // 獲取段狀態的函數
  const getSegmentState = (segment) => {
    // 先檢查用戶選擇的狀態
    const userState = selectedSegments[`${segment}${digitIndex}`] || 0;
    
    // 檢查問題4的狀態
    const question4State = getQuestion4State(segment);
    
    // 如果問題4有狀態，優先使用問題4的狀態
    if (question4State !== null) {
      return question4State;
    }
    
    return userState;
  };

  // 獲取問題4的段狀態
  const getQuestion4State = (segment) => {
    // 找到問題4的記錄
    const question4Records = list.filter(item => item.type === 4);
    
    for (const record of question4Records) {
      const { in: positionStr, out } = record;
      
      // 解析位置字符串，如 "A+K"
      const [xPos, yPos] = positionStr.split('+');
      if (!xPos || !yPos) continue;
      
      const xData = positionMapping[xPos];
      const yData = positionMapping[yPos];
      
      if (!xData || !yData) continue;
      
      // 檢查當前段是否在交集範圍內
      const commonSegments = xData.segments.filter(seg => yData.segments.includes(seg));
      if (!commonSegments.includes(segment)) continue;
      
      // 檢查當前數字位置是否在交集範圍內
      const commonDigits = xData.digits.filter(digit => yData.digits.includes(digit));
      const currentDigit = digitPositions[digitIndex];
      if (!commonDigits.includes(currentDigit)) continue;
      
      // 返回問題4的狀態
      return out ? 2 : -2;
    }
    
    return null;
  };

  // 獲取段顏色的函數
  const getSegmentColor = (segment) => {
    const state = getSegmentState(segment);
    if (state === 1) return "#00ff00";  // 用戶標記 - 綠色
    if (state === -1) return "#e74c3c"; // 用戶排除 - 紅色
    if (state === 2) return "#00B050";  // 問題4成功 - 深綠色
    if (state === -2) return "#B21016"; // 問題4失敗 - 深紅色
    return "#333"; // 未標記 - 深灰色
  };

  // 處理段點擊的函數
  const handleSegmentClick = (segment) => {
    const state = getSegmentState(segment);
    // 禁止刪除問題4的狀態 (2 和 -2)
    if (state === 2 || state === -2) return;
    onSegmentClick(`${segment}${digitIndex}`);
  };

  // 七段顯示器配置 - 響應式設計
  const displayWidth = isMobileView ? 60 : 80; // 手機版更小
  const displayHeight = isMobileView ? 90 : 130; // 手機版更小
  
  // 段的大小配置
  const segmentConfig = {
    horizontalWidth: isMobileView ? 49 : 60, // 橫段寬度
    horizontalHeight: isMobileView ? 4 : 6, // 橫段高度
    verticalWidth: isMobileView ? 4 : 6, // 豎段寬度
    verticalHeight: isMobileView ? 36 : 50, // 豎段高度
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
          onClick={() => handleSegmentClick('a')}
          style={{
            position: 'absolute',
            top: isMobileView ? '8px' : '10px',
            left: isMobileView ? '10px' : '15px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('a'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('a') === 2 || getSegmentState('a') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 b (右上) */}
        <div 
          onClick={() => handleSegmentClick('b')}
          style={{
            position: 'absolute',
            top: isMobileView ? '12px' : '16px',
            right: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('b'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('b') === 2 || getSegmentState('b') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 c (右下) */}
        <div 
          onClick={() => handleSegmentClick('c')}
          style={{
            position: 'absolute',
            top: isMobileView ? '53px' : '70px',
            right: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('c'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('c') === 2 || getSegmentState('c') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 d (底部) */}
        <div 
          onClick={() => handleSegmentClick('d')}
          style={{
            position: 'absolute',
            bottom: isMobileView ? '8px' : '15px',
            left: isMobileView ? '10px' : '18px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('d'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('d') === 2 || getSegmentState('d') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 e (左下) */}
        <div 
          onClick={() => handleSegmentClick('e')}
          style={{
            position: 'absolute',
            top: isMobileView ? '55px' : '70px',
            left: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('e'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('e') === 2 || getSegmentState('e') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 f (左上) */}
        <div 
          onClick={() => handleSegmentClick('f')}
          style={{
            position: 'absolute',
            top: isMobileView ? '12px' : '16px',
            left: isMobileView ? '8px' : '12px',
            width: segmentConfig.verticalWidth,
            height: segmentConfig.verticalHeight,
            backgroundColor: getSegmentColor('f'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('f') === 2 || getSegmentState('f') === -2 ? 'not-allowed' : 'pointer'
          }} 
        />
        
        {/* 段 g (中間) */}
        <div 
          onClick={() => handleSegmentClick('g')}
          style={{
            position: 'absolute',
            top: isMobileView ? '48px' : '65px',
            left: isMobileView ? '10px' : '18px',
            width: segmentConfig.horizontalWidth,
            height: segmentConfig.horizontalHeight,
            backgroundColor: getSegmentColor('g'),
            borderRadius: segmentConfig.borderRadius,
            transition: 'all 0.3s ease',
            cursor: getSegmentState('g') === 2 || getSegmentState('g') === -2 ? 'not-allowed' : 'pointer'
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
              top: "10%",
              left: "50%",
              transform: "translateX(-50%) translateY(8px)",
            } : {
              // 奇數：顯示在 a-g 段上方
              top: "-35%",
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