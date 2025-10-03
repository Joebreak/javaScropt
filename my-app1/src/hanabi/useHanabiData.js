import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";
import { NUMBER_COLOR_MAP } from "./gameData";

export function useHanabiData(intervalMs = 0, room, rank = null) {
  if (!room) {
    throw new Error('useHanabiData: room 參數是必須的');
  }
  
  const [data, setData] = useState({ list: [] });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) {
      return;
    }
    isFetchingRef.current = true;
    setLoading(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const requestOptions = {
        method: "GET",
        headers: {},
        signal: controller.signal,
      };
      
      // 使用 digitcode 專用的 API 端點
      const apiUrl = getApiUrl('cloudflare_room_url');
      const res = await fetch(apiUrl + room, requestOptions);
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // 處理 DigitCode 專用的資料格式
      const filteredList = Array.isArray(json)
      ? json
        .filter(item => item && item.round !== 0)
        .map(item => ({ id: item.id, round: item.round, ...item.data }))
        .reverse()
      : [];

      // 獲取遊戲設定資料 (round 0)
      const roundZeroData = Array.isArray(json)
        ? json
          .filter(item => item && item.round === 0)[0] || null
        : null;

      // 處理 mapData 來發牌
      const mapData = roundZeroData?.list || [];
      const playerCount = roundZeroData?.data?.NOTE2 || 2; // 玩家數量
      
      // 根據 mapData 創建卡片
      const allCards = mapData.map((card) => ({
        id: card.NOTE1, // 使用 NOTE1 作為唯一識別碼
        color: NUMBER_COLOR_MAP[card.NOTE2] || 'UNKNOWN',
        number: card.NOTE3,
        hintColor: false, // 是否有顏色提示
        hintNumber: false // 是否有數字提示
      }));
      
      // 發牌給每個玩家 - 每個人固定5張牌
      const players = [];
      const cardsPerPlayer = 5; // 固定每人5張牌
      
      // 從傳遞的參數或 URL 參數獲取當前玩家的 rank
      const urlParams = new URLSearchParams(window.location.search);
      const currentPlayerRank = parseInt(rank) || (urlParams.get('rank') 
        ? parseInt(urlParams.get('rank')) 
        : 2); // 預設為 rank 2
      
      // 檢查當前玩家是否超過最大人數
      const isPlayerExceeded = currentPlayerRank > playerCount;
      
      // 按照 NOTE1 順序輪流發牌
      for (let i = 0; i < playerCount; i++) {
        const playerCards = [];
        
        // 輪流發牌：第1張給順位1，第2張給順位2，第3張給順位1，以此類推
        for (let cardIndex = 0; cardIndex < cardsPerPlayer; cardIndex++) {
          const globalCardIndex = (cardIndex * playerCount) + i;
          if (globalCardIndex < allCards.length) {
            playerCards.push(allCards[globalCardIndex]);
          }
        }
        
        const isSelf = (i + 1) === currentPlayerRank && !isPlayerExceeded;
        
        players.push({
          name: `玩家${i + 1}`,
          rank: i + 1,
          hand: playerCards,
          isSelf: isSelf
        });
      }
      
      // 如果玩家超過最大人數，不添加觀看者到 players 陣列
      // 觀看者只存在於邏輯中，不佔用桌面位置
      
      // 創建剩餘的牌堆（發完牌後剩餘的卡片）
      const usedCardIds = new Set();
      players.forEach(player => {
        player.hand.forEach(card => {
          usedCardIds.add(card.id);
        });
      });
      
      const deck = allCards.filter(card => !usedCardIds.has(card.id));
      
      // 初始化 fireworks 結構（每種顏色一個陣列）
      const initializeFireworks = () => {
        const fireworks = {};
        Object.values(NUMBER_COLOR_MAP).forEach(color => {
          fireworks[color] = [];
        });
        return fireworks;
      };

      // 檢查卡片是否可以放置到 fireworks
      const canPlaceCard = (card, fireworks) => {
        const colorFireworks = fireworks[card.color] || [];
        const nextNumber = colorFireworks.length + 1;
        return card.number === nextNumber;
      };

      // 處理卡片出牌動作
      const playCard = (card, gameState) => {
        const newGameState = { ...gameState };
        
        if (canPlaceCard(card, newGameState.fireworks)) {
          // 可以放置，加入 fireworks
          if (!newGameState.fireworks[card.color]) {
            newGameState.fireworks[card.color] = [];
          }
          newGameState.fireworks[card.color].push(card);
        } else {
          // 不能放置，加入 discardPile 並減少生命值
          newGameState.discardPile.push(card);
          newGameState.lives = Math.max(0, newGameState.lives - 1);
        }
        
        return newGameState;
      };

      // 處理卡片棄牌動作
      const discardCard = (card, gameState) => {
        const newGameState = { ...gameState };
        
        // 加入 discardPile
        newGameState.discardPile.push(card);
        
        // 增加提示次數（最多8次）
        newGameState.hints = Math.min(8, newGameState.hints + 1);
        
        return newGameState;
      };

      // 為 Hanabi 創建適合的資料結構
      const gameState = {
        players: players,
        discardPile: roundZeroData?.data?.discardPile || [],
        fireworks: initializeFireworks(), // 總是使用初始化的 fireworks
        deck: deck, // 剩餘的牌堆
        currentPlayerIndex: roundZeroData?.data?.currentPlayerIndex || 0,
        lastRoundTriggerPlayer: roundZeroData?.data?.lastRoundTriggerPlayer || null,
        lives: roundZeroData?.data?.lives || 3, // 生命值
        hints: roundZeroData?.data?.hints || 8 // 提示次數
      };

      // 處理 filteredList 中的動作
      filteredList.forEach(action => {
        if (action.type === 1) { // 提示顏色
          const targetPlayer = gameState.players.find(p => p.rank === action.player);
          if (targetPlayer) {
            targetPlayer.hand.forEach(card => {
              if (card.color === action.out) {
                card.hintColor = true;
              }
            });
          }
        } else if (action.type === 2) { // 提示數字
          const targetPlayer = gameState.players.find(p => p.rank === action.player);
          if (targetPlayer) {
            targetPlayer.hand.forEach(card => {
              if (parseInt(card.number) === parseInt(action.out)) {
                card.hintNumber = true;
              }
            });
          }
        } else if (action.type === 3) { // 出牌到煙火
          // 找到出牌的玩家
          const player = gameState.players.find(p => p.rank === action.player);
          if (player) {
            // 從玩家手牌中找到要出的卡片
            const cardIndex = player.hand.findIndex(card => card.id === action.in);
            if (cardIndex !== -1) {
              const card = player.hand[cardIndex];
              
              // 從玩家手牌中移除這張卡片
              player.hand.splice(cardIndex, 1);
              
              // 檢查是否可以放置到 fireworks
              if (canPlaceCard(card, gameState.fireworks)) {
                // 可以放置，加入 fireworks
                if (!gameState.fireworks[card.color]) {
                  gameState.fireworks[card.color] = [];
                }
                gameState.fireworks[card.color].push(card);
              } else {
                // 不能放置，加入 discardPile 並減少生命值
                gameState.discardPile.push(card);
                gameState.lives = Math.max(0, gameState.lives - 1);
              }
              
              // 從 deck 中抽一張新牌給玩家
              if (gameState.deck.length > 0) {
                const newCard = gameState.deck.shift(); // 從牌堆頂部取一張牌
                player.hand.push(newCard);
              }
            }
          }
        } else if (action.type === 4) { // 棄牌
          // 找到棄牌的玩家
          const player = gameState.players.find(p => p.rank === action.player);
          if (player) {
            // 從玩家手牌中找到要棄的卡片
            const cardIndex = player.hand.findIndex(card => card.id === action.in);
            if (cardIndex !== -1) {
              const card = player.hand[cardIndex];
              
              // 從玩家手牌中移除這張卡片
              player.hand.splice(cardIndex, 1);
              
              // 加入 discardPile 並增加提示次數
              gameState.discardPile.push(card);
              gameState.hints = Math.min(8, gameState.hints + 1);
              
              // 從 deck 中抽一張新牌給玩家
              if (gameState.deck.length > 0) {
                const newCard = gameState.deck.shift(); // 從牌堆頂部取一張牌
                player.hand.push(newCard);
              }
            }
          }
        }
      });
      setData({
        list: filteredList,
        gameState: gameState,
        mapData: roundZeroData?.list || [],
        // 遊戲邏輯函數
        gameLogic: {
          canPlaceCard,
          playCard,
          discardCard
        }
      });

    } catch (err) {
      console.error("Hanabi API 失敗：", err);
      // 直接拋出錯誤，不使用範本資料
      throw err;
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [room, rank]);

  useEffect(() => {
    let mounted = true;
    let intervalId = null;

    fetchData();

    if (intervalMs > 0) {
      intervalId = setInterval(() => {
        if (mounted) {
          fetchData();
        }
      }, intervalMs);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalMs, fetchData]);

  return { data, loading, refresh: fetchData };
}
