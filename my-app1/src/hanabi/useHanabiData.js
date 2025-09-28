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
      
      // 按照 NOTE1 順序輪流發牌
      for (let i = 0; i < members; i++) {
        const playerCards = [];
        
        // 輪流發牌：第1張給順位1，第2張給順位2，第3張給順位1，以此類推
        for (let cardIndex = 0; cardIndex < cardsPerPlayer; cardIndex++) {
          const globalCardIndex = (cardIndex * members) + i;
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
