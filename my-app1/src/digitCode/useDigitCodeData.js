import { useEffect, useState, useCallback, useRef } from "react";
import { getApiUrl } from "../config/api";

export function useDigitCodeData(intervalMs = 0, room) {
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
          .map(item => ({
            id: item.id,
            round: item.round,
            player: item.data?.player || 1,
            type: item.data?.type || 'question', // 'question' 或 'answer'
            questionType: item.data?.questionType,
            questionData: item.data?.questionData,
            answer: item.data?.answer,
            isCorrect: item.data?.isCorrect,
            timestamp: item.data?.timestamp || new Date().toISOString(),
            ...item.data
          }))
          .reverse()
        : [];

      // 獲取遊戲設定資料 (round 0)
      const gameSetupData = Array.isArray(json)
        ? json
          .filter(item => item && item.round === 0)[0] || null
        : null;

      setData({
        list: filteredList,
        gameSetup: gameSetupData?.data || {},
        members: gameSetupData?.data?.members || 2,
        gameStatus: gameSetupData?.data?.gameStatus || 'active',
        currentPlayer: gameSetupData?.data?.currentPlayer || 1,
        gamePhase: gameSetupData?.data?.gamePhase || 'setup',
        myCode: gameSetupData?.data?.myCode || []
      });

    } catch (err) {
      console.error("DigitCode API 失敗：", err);
      // 如果 API 失敗，使用模擬資料
      setData({
        list: [
          {
            id: 1,
            round: 1,
            in: 'question',
            out: 1,
            color: 'blue'
          },
          {
            id: 2,
            round: 2,
            in: 'answer',
            out: 2,
            color: 'green'
          },
          {
            id: 3,
            round: 3,
            in: 'question',
            out: 3,
            color: 'red'
          }
        ],
        gameSetup: {},
        members: 2,
        gameStatus: 'active',
        currentPlayer: 1,
        gamePhase: 'playing',
        myCode: [1, 2, 3, 4, 5, 6] // 模擬 API 提供的代碼
      });
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [room]);

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
