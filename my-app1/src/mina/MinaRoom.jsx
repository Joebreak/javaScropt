import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import styles from "./MinaRoom.module.css";

function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ list: [] });
  const abortRef = useRef(null);

  const nodeRef = useRef(null);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("triangle-pos");
    return saved ? JSON.parse(saved) : { x: 0, y: 0 };
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const minDelay = wait(600);

        const controller = new AbortController();
        abortRef.current = controller;
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(
          "https://voter.dev.box70000.com/api/admin/voter/visitRecord/2",
          {
            method: "GET",
            headers: {
              authorization:
                "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5IiwiZXhwIjoxNzU1OTQwMTYwfQ.yKvsvZkRtAt5UQEFdQ3h8wkFh6XG0WWaftX2O95umnk",
            },
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const body = JSON.parse(json.data.description);

        if (mounted) {
          await minDelay;
          setData({ list: body?.list ?? [] });
        }
      } catch (err) {
        if (mounted) console.error("API 失敗：", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  const handleStop = (e, data) => {
    const newPos = { x: data.x, y: data.y };
    setPosition(newPos);
    localStorage.setItem("triangle-pos", JSON.stringify(newPos));
  };

  const rows = 8;
  const cols = 10;
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );

  if (loading) return <div className={styles.loading}>⏳ 載入中...</div>;

  return (
    <div className={styles.container}>
      <div
        className={styles.gridWrapper}
        style={{
          gridTemplateRows: `repeat(${rows}, 30px)`,
          gridTemplateColumns: `repeat(${cols}, 30px)`,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className={styles.gridCell} />
          ))
        )}

        <Draggable nodeRef={nodeRef} position={position} onStop={handleStop}>
          <div ref={nodeRef} className={styles.draggableTriangle} />
        </Draggable>
      </div>

      <h2 className={styles.title}>mina (房間號碼 {room})</h2>

      <div className={styles.tableWrapper}>
        <div className={styles.card}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {["in", "out", "顏色"].map((title, i) => (
                    <th key={i} className={styles.stickyHeader}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data.list) &&
                  data.list.map((item, index) => (
                    <tr key={index}>
                      <td className={styles.tdCell}>{item.in}</td>
                      <td className={styles.tdCell}>{item.out}</td>
                      <td className={styles.tdCell}>{item.color}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button className={styles.button} onClick={() => navigate("/")}>
        返回首頁
      </button>
    </div>
  );
}

export default MinaRoom;