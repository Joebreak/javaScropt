// 顏色常數 - 確保一致性
export const COLOR_KEYS = {
  RED: 'RED',
  GREEN: 'GREEN', 
  BLUE: 'BLUE',
  YELLOW: 'YELLOW',
  WHITE: 'WHITE'
};

// 花火遊戲顏色定義
export const CARD_COLORS = {
  RED: {
    name: "紅色",
    bgColor: "crimson",
    textColor: "#fff",
    borderColor: "#8B0000"
  },
  GREEN: {
    name: "綠色", 
    bgColor: "seagreen",
    textColor: "#fff",
    borderColor: "#006400"
  },
  BLUE: {
    name: "藍色",
    bgColor: "royalblue", 
    textColor: "#fff",
    borderColor: "#0000CD"
  },
  YELLOW: {
    name: "黃色",
    bgColor: "goldenrod",
    textColor: "#fff", 
    borderColor: "#B8860B"
  },
  WHITE: {
    name: "白色",
    bgColor: "lightgray",
    textColor: "#000",
    borderColor: "#A9A9A9"
  },
  // 範例：添加新顏色只需要在這裡定義
  // PURPLE: {
  //   name: "紫色",
  //   bgColor: "purple",
  //   textColor: "#fff",
  //   borderColor: "#4B0082"
  // },
  // ORANGE: {
  //   name: "橙色", 
  //   bgColor: "orange",
  //   textColor: "#fff",
  //   borderColor: "#FF8C00"
  // }
};

// 花火遊戲資料
export const initialPlayers = [{
  name: "你",
  isSelf: true,
  hand: [{
    color: COLOR_KEYS.RED,
    number: 3,
    knownColor: false,
    knownNumber: true
  }, {
    color: COLOR_KEYS.BLUE,
    number: 1,
    knownColor: false,
    knownNumber: false
  }, {
    color: COLOR_KEYS.YELLOW,
    number: 2,
    knownColor: true,
    knownNumber: false
  }]
}, {
  name: "A1",
  hand: [{
    color: COLOR_KEYS.RED,
    number: 1,
    knownColor: true,
    knownNumber: true
  }, {
    color: COLOR_KEYS.GREEN,
    number: 3,
    knownColor: true,
    knownNumber: false
  }, {
    color: COLOR_KEYS.BLUE,
    number: 2,
    knownColor: false,
    knownNumber: true
  }]
}, {
  name: "A2",
  hand: [{
    color: COLOR_KEYS.RED,
    number: 1,
    knownColor: true,
    knownNumber: true
  }, {
    color: COLOR_KEYS.GREEN,
    number: 3,
    knownColor: true,
    knownNumber: false
  }, {
    color: COLOR_KEYS.YELLOW,
    number: 5,
    knownColor: false,
    knownNumber: true
  }, {
    color: COLOR_KEYS.GREEN,
    number: 1,
    knownColor: false,
    knownNumber: true
  }]
}];

export const initialDiscardPile = [{
  color: COLOR_KEYS.RED,
  number: 1
}, {
  color: COLOR_KEYS.BLUE,
  number: 4
}, {
  color: COLOR_KEYS.GREEN,
  number: 2
}, {
  color: COLOR_KEYS.GREEN,
  number: 3
}];

export const initialFireworks = [{
  color: COLOR_KEYS.RED,
  number: 2
}, {
  color: COLOR_KEYS.BLUE,
  number: 1
}, {
  color: COLOR_KEYS.GREEN,
  number: 3
}];

// 預設遊戲狀態
export const getInitialGameState = () => ({
  players: initialPlayers,
  discardPile: initialDiscardPile,
  fireworks: initialFireworks,
  currentPlayerIndex: 0,
  gamePhase: 'playing' // 遊戲階段：playing, ended
});

// 生成 CSS 變數字串
export const generateCSSVariables = () => {
  let cssVars = ':root {\n';
  
  Object.entries(CARD_COLORS).forEach(([colorKey, colorData]) => {
    const varName = colorKey.toLowerCase();
    cssVars += `  --card-${varName}-bg: ${colorData.bgColor};\n`;
    cssVars += `  --card-${varName}-text: ${colorData.textColor};\n`;
    cssVars += `  --card-${varName}-border: ${colorData.borderColor};\n`;
  });
  
  cssVars += '}';
  return cssVars;
};

// 獲取顏色資料
export const getColorData = (colorKey) => {
  return CARD_COLORS[colorKey] || null;
};

// 獲取所有顏色列表
export const getAllColors = () => {
  return Object.keys(CARD_COLORS);
};

// 檢查顏色是否存在
export const hasColor = (colorKey) => {
  return colorKey in CARD_COLORS;
};

// 獲取預設顏色（當顏色不存在時使用）
export const getDefaultColor = () => ({
  name: "未知",
  bgColor: "#ddd",
  textColor: "#999",
  borderColor: "#ccc"
});

// 安全獲取顏色資料（如果不存在則返回預設值）
export const getSafeColorData = (colorKey) => {
  return CARD_COLORS[colorKey] || getDefaultColor();
};

// 驗證顏色一致性 - 檢查所有使用的顏色是否都在 CARD_COLORS 中定義
export const validateColorConsistency = () => {
  const allUsedColors = new Set();
  
  // 收集所有使用的顏色
  initialPlayers.forEach(player => {
    player.hand.forEach(card => {
      allUsedColors.add(card.color);
    });
  });
  
  initialDiscardPile.forEach(card => {
    allUsedColors.add(card.color);
  });
  
  initialFireworks.forEach(card => {
    allUsedColors.add(card.color);
  });
  
  // 檢查未定義的顏色
  const undefinedColors = Array.from(allUsedColors).filter(color => !hasColor(color));
  
  if (undefinedColors.length > 0) {
    console.warn('發現未定義的顏色:', undefinedColors);
    return false;
  }
  
  console.log('所有顏色都已正確定義');
  return true;
};
