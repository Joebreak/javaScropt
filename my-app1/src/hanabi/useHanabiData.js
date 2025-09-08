import { useState, useEffect } from 'react';
import { getInitialGameState } from './gameData';

// 模擬從 API 獲取遊戲資料
const fetchGameData = async (roomId) => {
  // 這裡之後可以替換為真實的 API 呼叫
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模擬根據房間 ID 獲取不同的遊戲資料
      const gameState = getInitialGameState();
      
      // 可以根據 roomId 調整資料
      if (roomId === '123') {
        // 特殊房間的資料
        gameState.players[0].name = `玩家_${roomId}`;
      }
      resolve(gameState);
    }, 1000);
  });
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

export const useHanabiData = (roomId) => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 載入遊戲資料
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGameData(roomId);
        setGameState(data);
      } catch (err) {
        setError(err.message);
        // 如果 API 失敗，使用預設資料
        setGameState(getInitialGameState());
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadGameData();
    }
  }, [roomId]);

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
    
    console.log(`當前玩家索引: ${gameState.currentPlayerIndex}, 玩家總數: ${playerCount}, 下一個索引: ${nextIndex}`);
    
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
    
    console.log(`設定玩家索引: ${playerIndex}, 玩家總數: ${playerCount}, 有效索引: ${validIndex}`);
    
    const newState = { 
      ...gameState, 
      currentPlayerIndex: validIndex 
    };
    updateState(newState);
  };

  // 獲取當前玩家 - 使用取餘數確保索引有效
  const getCurrentPlayer = () => {
    if (!gameState) return null;
    
    const playerCount = gameState.players.length;
    const validIndex = ((gameState.currentPlayerIndex % playerCount) + playerCount) % playerCount;
    
    return gameState.players[validIndex];
  };

  // 測試取餘數邏輯的函數
  const testModuloLogic = () => {
    if (!gameState) return;
    
    const playerCount = gameState.players.length;
    console.log(`=== 取餘數邏輯測試 (玩家總數: ${playerCount}) ===`);
    
    for (let i = -2; i <= playerCount + 2; i++) {
      const validIndex = ((i % playerCount) + playerCount) % playerCount;
      console.log(`輸入索引: ${i} -> 有效索引: ${validIndex} -> 玩家: ${gameState.players[validIndex]?.name || 'N/A'}`);
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
    testModuloLogic
  };
};
