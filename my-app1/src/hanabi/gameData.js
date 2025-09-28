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
  },
  GREEN: {
    name: "綠色",
    bgColor: "seagreen",
  },
  BLUE: {
    name: "藍色",
    bgColor: "royalblue",
  },
  YELLOW: {
    name: "黃色",
    bgColor: "goldenrod",
  },
  WHITE: {
    name: "白色",
    bgColor: "lightgray",
    textColor: "#000",
  },
};

// 花火遊戲資料
export const initialPlayers = [{
  name: "你",
  rank: 1,
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
  rank: 2,
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
  rank: 3,
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
    knownNumber: false
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

// 初始遊戲記錄 - 已移除，改由 API 提供

// 預設遊戲狀態（本地資料）
export const getInitialGameState = () => {
  // 按 rank 排序玩家
  let players = [...initialPlayers].sort((a, b) => a.rank - b.rank);

  return {
    players,
    discardPile: initialDiscardPile,
    fireworks: initialFireworks,
    currentPlayerIndex: 0, // > -1: 目前輪到的玩家索引, -1: 遊戲結束
    lastRoundTriggerPlayer: null // 最後一輪觸發條件的人
  };
};

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk"

// 從 API 獲取遊戲狀態
export const fetchGameStateFromAPI = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      "https://voter.dev.box70000.com/api/admin/voter/visitRecord/3",
      {
        method: "GET",
        headers: {
          authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = await res.json();
    let data = {};
    try {
      data = JSON.parse(json.data.description ?? "{}");
    } catch {
      data = {};
    }
    
    // 按 rank 排序玩家
    let players = (data.players || []).sort((a, b) => (a.rank || 0) - (b.rank || 0));

    return {
      players,
      discardPile: data.discardPile || [],
      fireworks: data.fireworks || {},
      currentPlayerIndex: data.currentPlayerIndex ?? 0,
      gameLog: data.gameLog || [],
      lastRoundTriggerPlayer: data.lastRoundTriggerPlayer || null
    };
  } catch (error) {
    console.error('獲取遊戲狀態失敗:', error);
    return getInitialGameState();
  }
};

// 更新遊戲狀態到 API
export const updateGameStateToAPI = async (roomId, gameState) => {
  try {
    // 這裡替換成真實的 API 調用
    const response = await fetch(`/api/game/${roomId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameState)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新遊戲狀態失敗:', error);
    throw error;
  }
};

export const generateCSSVariables = () => {
  let cssVars = ':root {\n';

  Object.entries(CARD_COLORS).forEach(([colorKey, colorData]) => {
    const varName = colorKey.toLowerCase();
    cssVars += `  --card-${varName}-bg: ${colorData.bgColor};\n`;
  });

  cssVars += '}';
  return cssVars;
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

// 遊戲記錄相關函數已移除，改由 useHanabiData 處理

// 遊戲狀態輔助函數
export const isGameEnded = (currentPlayerIndex) => {
  return currentPlayerIndex === -1;
};

export const getCurrentPlayer = (players, currentPlayerIndex) => {
  if (!players || !Array.isArray(players) || isGameEnded(currentPlayerIndex)) {
    return null;
  }
  return players[currentPlayerIndex] || null;
};

export const endGame = () => {
  return -1;
};

export const startGame = (playerIndex = 0) => {
  return Math.max(0, playerIndex);
};

