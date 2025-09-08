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

// 初始遊戲記錄
export const initialGameLog = [
  { action: "遊戲開始", player: "系統" },
  { action: "出牌", player: "A1" },
  { action: "提示顏色", player: "A2" },
  { action: "棄牌", player: "A1" },
  { action: "出牌", player: "A2" },
  { action: "提示數字", player: "A1" }
];

// 預設遊戲狀態（本地資料）
export const getInitialGameState = (playerName = null) => {
  // 根據玩家名稱設定 isSelf
  let players = initialPlayers.map(player => ({
    ...player,
    isSelf: playerName ? player.name === playerName : player.isSelf
  }));

  // 重新排序玩家，讓自己排在第一位，形成循環順序
  if (playerName && players.length > 1) {
    const selfIndex = players.findIndex(player => player.isSelf);
    if (selfIndex > 0) {
      // 將自己移到第一位，其他玩家按原順序跟在後面
      const reorderedPlayers = [
        players[selfIndex], // 自己排第一位
        ...players.slice(selfIndex + 1), // 自己後面的玩家
        ...players.slice(0, selfIndex)   // 自己前面的玩家
      ];
      players = reorderedPlayers;
    }
  }

  return {
    players,
    discardPile: initialDiscardPile,
    fireworks: initialFireworks,
    currentPlayerIndex: 0, // > -1: 目前輪到的玩家索引, -1: 遊戲結束
    gameLog: initialGameLog,
    lastRoundTriggerPlayer: null // 最後一輪觸發條件的人
  };
};

const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk"

// 從 API 獲取遊戲狀態
export const fetchGameStateFromAPI = async (playerName = null) => {
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
    // 根據玩家名稱設定 isSelf
    let players = (data.players || []).map(player => ({
      ...player,
      isSelf: playerName ? player.name === playerName : false
    }));

    if (playerName && players.length > 1) {
      const selfIndex = players.findIndex(player => player.isSelf);
      
      if (selfIndex > 0) {
        // 將自己移到第一位，其他玩家按原順序跟在後面
        const reorderedPlayers = [
          players[selfIndex],
          ...players.slice(selfIndex + 1),
          ...players.slice(0, selfIndex)
        ];
        players = reorderedPlayers;
        
        // 調整currentPlayerIndex，因為玩家順序改變了
        const originalCurrentIndex = data.currentPlayerIndex ?? 0;
        const originalCurrentPlayer = data.players[originalCurrentIndex];
        const newCurrentIndex = players.findIndex(player => player.name === originalCurrentPlayer?.name);
        
        return {
          players,
          discardPile: data.discardPile || [],
          fireworks: data.fireworks || {},
          currentPlayerIndex: newCurrentIndex >= 0 ? newCurrentIndex : 0,
          gameLog: data.gameLog || [],
          lastRoundTriggerPlayer: data.lastRoundTriggerPlayer || null
        };
      } else {
        console.log(`自己已經在第一位，不需要重新排序`);
      }
    }

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
    return getInitialGameState(playerName);
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

// 模擬 API 獲取遊戲記錄
export const fetchGameLog = async (roomId) => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 500));

  // 這裡之後會替換成真實的 API 調用
  return {
    success: true,
    data: initialGameLog,
    message: '遊戲記錄獲取成功'
  };
};

// 模擬 API 添加遊戲記錄
export const addGameLogEntry = async (roomId, entry) => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // 這裡之後會替換成真實的 API 調用
  const newEntry = {
    ...entry,
    time: new Date().toLocaleTimeString('zh-TW', { hour12: false })
  };
  
  return {
    success: true,
    data: newEntry,
    message: '遊戲記錄添加成功'
  };
};

// 遊戲狀態輔助函數
export const isGameEnded = (currentPlayerIndex) => {
  return currentPlayerIndex === -1;
};

export const getCurrentPlayer = (players, currentPlayerIndex) => {
  if (isGameEnded(currentPlayerIndex)) {
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

