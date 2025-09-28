import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

export function useDigitCodeData(intervalMs = 0, room, rank = null) {
  if (!room) {
    throw new Error('useDigitCodeData: room 參數是必須的');
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
      const members = roundZeroData?.data?.NOTE2 || 2;
      
      // 顏色映射
      const colorMap = {
        1: 'RED',
        2: 'GREEN', 
        3: 'BLUE',
        4: 'YELLOW',
        5: 'WHITE'
      };
      
      // 根據 mapData 創建卡片
      const allCards = mapData.map(card => ({
        color: colorMap[card.NOTE2] || 'UNKNOWN',
        number: card.NOTE3,
        knownColor: false,
        knownNumber: false
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
      const isPlayerExceeded = currentPlayerRank > members;
      
      console.log('除錯資訊:', {
        currentPlayerRank,
        members,
        isPlayerExceeded
      });
      
      for (let i = 0; i < members; i++) {
        const startIndex = i * cardsPerPlayer;
        const endIndex = startIndex + cardsPerPlayer;
        const playerCards = allCards.slice(startIndex, endIndex);
        
        const isSelf = (i + 1) === currentPlayerRank && !isPlayerExceeded;
        console.log(`玩家${i + 1}: rank=${i + 1}, currentPlayerRank=${currentPlayerRank}, isSelf=${isSelf}`);
        
        players.push({
          name: `玩家${i + 1}`,
          rank: i + 1,
          hand: playerCards,
          isSelf: isSelf
        });
      }
      
      // 如果玩家超過最大人數，不添加觀看者到 players 陣列
      // 觀看者只存在於邏輯中，不佔用桌面位置
      
      // 為 Hanabi 創建適合的資料結構
      const gameState = {
        players: players,
        discardPile: roundZeroData?.data?.discardPile || [],
        fireworks: roundZeroData?.data?.fireworks || [],
        currentPlayerIndex: roundZeroData?.data?.currentPlayerIndex || 0,
        lastRoundTriggerPlayer: roundZeroData?.data?.lastRoundTriggerPlayer || null
      };

      setData({
        list: filteredList,
        gameState: gameState,
        mapData: roundZeroData?.list || [],
        members: roundZeroData?.data?.NOTE2 || null
      });

    } catch (err) {
      console.error("Hanabi API 失敗：", err);
      // 提供預設的遊戲資料
      const defaultMapData = [
        { NOTE1: 1, NOTE2: 1, NOTE3: 1 }, // RED 1
        { NOTE1: 2, NOTE2: 2, NOTE3: 2 }, // GREEN 2
        { NOTE1: 3, NOTE2: 3, NOTE3: 3 }, // BLUE 3
        { NOTE1: 4, NOTE2: 4, NOTE3: 4 }, // YELLOW 4
        { NOTE1: 5, NOTE2: 5, NOTE3: 5 }, // WHITE 5
        { NOTE1: 6, NOTE2: 1, NOTE3: 2 }, // RED 2
        { NOTE1: 7, NOTE2: 2, NOTE3: 3 }, // GREEN 3
        { NOTE1: 8, NOTE2: 3, NOTE3: 4 }, // BLUE 4
        { NOTE1: 9, NOTE2: 4, NOTE3: 5 }, // YELLOW 5
        { NOTE1: 10, NOTE2: 5, NOTE3: 1 }  // WHITE 1
      ];
      
      const members = 2;
      const colorMap = {
        1: 'RED',
        2: 'GREEN', 
        3: 'BLUE',
        4: 'YELLOW',
        5: 'WHITE'
      };
      
      const allCards = defaultMapData.map(card => ({
        color: colorMap[card.NOTE2] || 'UNKNOWN',
        number: card.NOTE3,
        knownColor: false,
        knownNumber: false
      }));
      
      const players = [];
      const cardsPerPlayer = 5; // 固定每人5張牌
      
      // 從傳遞的參數或 URL 參數獲取當前玩家的 rank
      const urlParams = new URLSearchParams(window.location.search);
      const currentPlayerRank = parseInt(rank) || (urlParams.get('rank') 
        ? parseInt(urlParams.get('rank')) 
        : 2); // 預設為 rank 2
      console.log('Rank 參數除錯:', {
        passedRank: rank,
        search: window.location.search,
        rankParam: urlParams.get('rank'),
        currentPlayerRank
      });
      
      // 檢查當前玩家是否超過最大人數
      const isPlayerExceeded = currentPlayerRank > members;
      console.log('除錯資訊:', {
        currentPlayerRank,
        members,
        isPlayerExceeded
      });
      
      for (let i = 0; i < members; i++) {
        const startIndex = i * cardsPerPlayer;
        const endIndex = startIndex + cardsPerPlayer;
        const playerCards = allCards.slice(startIndex, endIndex);
        
        players.push({
          name: `玩家${i + 1}`,
          rank: i + 1,
          hand: playerCards,
          isSelf: (i + 1) === currentPlayerRank && !isPlayerExceeded // 只有當玩家在範圍內且匹配時才是自己
        });
      }
      
      // 如果玩家超過最大人數，不添加觀看者到 players 陣列
      // 觀看者只存在於邏輯中，不佔用桌面位置
      
      const defaultGameState = {
        players: players,
        discardPile: [],
        fireworks: [],
        currentPlayerIndex: 0,
        lastRoundTriggerPlayer: null
      };
      
      setData({
        list: [],
        gameState: defaultGameState,
        mapData: defaultMapData,
        members: members
      });
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
