import { useState, useEffect } from 'react';
import { getInitialGameState, fetchGameStateFromAPI,fetchGameLog, addGameLogEntry, isGameEnded, getCurrentPlayer as getCurrentPlayerFromData } from './gameData';

// 從 API 獲取遊戲資料
const fetchGameData = async (roomId, playerName = null) => {
  try {
    const gameState = await fetchGameStateFromAPI(playerName);
    return gameState;
  } catch (error) {
    console.error('獲取遊戲資料失敗:', error);
    return getInitialGameState(playerName);
  }
};

// 模擬更新遊戲狀態的 API
const updateGameState = async (roomId, newState) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 這裡之後可以替換為真實的 API 呼叫
      console.log('更新遊戲狀態:', roomId, newState);
      resolve(newState);
    }, 500);
  });
};

export const useHanabiData = (roomId, playerName = null) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入遊戲資料
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGameData(roomId, playerName);
        setGameState(data);
      } catch (err) {
        setError(err.message);
        // 如果 API 失敗，使用預設資料
        setGameState(getInitialGameState(playerName));
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadGameData();
    }
  }, [roomId, playerName]);

  // 更新遊戲狀態
  const updateState = async (newState) => {
    try {
      setLoading(true);
      const updatedState = await updateGameState(roomId, newState);
      setGameState(updatedState);
    } catch (err) {
      setError(err.message);
      // 即使 API 失敗，也更新本地狀態
      setGameState(newState);
    } finally {
      setLoading(false);
    }
  };

  // 更新玩家資料
  const updatePlayers = (newPlayers) => {
    const newState = { ...gameState, players: newPlayers };
    updateState(newState);
  };

  // 更新棄牌堆
  const updateDiscardPile = (newDiscardPile) => {
    const newState = { ...gameState, discardPile: newDiscardPile };
    updateState(newState);
  };

  // 更新煙火
  const updateFireworks = (newFireworks) => {
    const newState = { ...gameState, fireworks: newFireworks };
    updateState(newState);
  };

  // 切換到下一個玩家 - 使用取餘數確保循環
  const nextPlayer = () => {
    if (!gameState) return;
    
    const playerCount = gameState.players.length;
    const nextIndex = (gameState.currentPlayerIndex + 1) % playerCount;
    
    const newState = { 
      ...gameState, 
      currentPlayerIndex: nextIndex 
    };
    updateState(newState);
  };

  // 切換到指定玩家 - 使用取餘數確保索引有效
  const setCurrentPlayer = (playerIndex) => {
    if (!gameState) return;
    
    const playerCount = gameState.players.length;
    // 使用取餘數確保索引在有效範圍內
    const validIndex = ((playerIndex % playerCount) + playerCount) % playerCount;
    
    const newState = { 
      ...gameState, 
      currentPlayerIndex: validIndex 
    };
    updateState(newState);
  };

  // 獲取當前玩家 - 整合遊戲狀態檢查
  const getCurrentPlayer = () => {
    if (!gameState) return null;
    return getCurrentPlayerFromData(gameState.players, gameState.currentPlayerIndex);
  };

  // 檢查遊戲是否結束
  const checkGameEnded = () => {
    if (!gameState) return false;
    return isGameEnded(gameState.currentPlayerIndex);
  };

  // 設定最後一輪觸發條件的人
  const setLastRoundTriggerPlayer = (playerIndex) => {
    updateState(prev => ({
      ...prev,
      lastRoundTriggerPlayer: playerIndex
    }));
  };

  // 獲取最後一輪觸發條件的人
  const getLastRoundTriggerPlayer = () => {
    if (!gameState) return null;
    return gameState.lastRoundTriggerPlayer;
  };

  // 檢查是否為最後一輪觸發條件的人
  const isLastRoundTriggerPlayer = (playerIndex) => {
    if (!gameState) return false;
    return gameState.lastRoundTriggerPlayer === playerIndex;
  };

  // 獲取遊戲記錄
  const fetchGameLogData = async () => {
    try {
      setLoading(true);
      const response = await fetchGameLog(roomId);
      if (response.success) {
        updateState(prev => ({
          ...prev,
          gameLog: response.data
        }));
      }
    } catch (err) {
      setError('獲取遊戲記錄失敗: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 添加遊戲記錄
  const addLogEntry = async (action, player) => {
    try {
      const response = await addGameLogEntry(roomId, { action, player });
      if (response.success) {
        updateState(prev => ({
          ...prev,
          gameLog: [...prev.gameLog, response.data]
        }));
      }
    } catch (err) {
      console.error('添加遊戲記錄失敗:', err);
    }
  };

  return {
    gameState,
    loading,
    error,
    updatePlayers,
    updateDiscardPile,
    updateFireworks,
    updateState,
    nextPlayer,
    setCurrentPlayer,
    getCurrentPlayer,
    fetchGameLogData,
    addLogEntry,
    checkGameEnded,
    setLastRoundTriggerPlayer,
    getLastRoundTriggerPlayer,
    isLastRoundTriggerPlayer
  };
};
