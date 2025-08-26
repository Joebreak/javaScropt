import React, { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import { useRoomData } from "../hooks/useRoomData";

function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { room } = location.state || {};

  const { data, loading } = useRoomData();

  const triangleRef = useRef(null);
  const paraRef = useRef(null);
  const rightTriangleRef = useRef(null);

  const posKeys = {
    triangle: "triangle-pos",
    parallelogram: "para-pos",
    rightTriangle: "right-triangle-pos",
  };
  const [shapes, setShapes] = useState({
    triangle: loadPos("triangle-pos"),
    parallelogram: loadPos("para-pos"),
    rightTriangle: loadPos("right-triangle-pos"),
  });
  const deleteArea = { x: 300, y: 0, width: 100, height: 100 }; // 右上角範例

  const handleStop = (type, d) => {
    const pos = { x: d.x, y: d.y };
    if (
      pos.x >= deleteArea.x &&
      pos.x <= deleteArea.x + deleteArea.width &&
      pos.y >= deleteArea.y &&
      pos.y <= deleteArea.y + deleteArea.height
    ) {
      setShapes(prev => ({ ...prev, [type]: null }));
      localStorage.removeItem(`${type}-pos`);
      return;
    }
    setShapes(prev => ({ ...prev, [type]: pos }));
    localStorage.setItem(`${type}-pos`, JSON.stringify(pos));
  };

  function loadPos(key) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  const addShape = (type) => {
    if (!shapes[type]) {
      const initPos = { x: 0, y: 0 };
      setShapes(prev => ({ ...prev, [type]: initPos }));
      localStorage.setItem(posKeys[type], JSON.stringify(initPos));
    }
  };
  const rows = 8;
  const cols = 10;
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );

  if (loading) return <div>⏳ 載入中...</div>;

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#f7f7f7" }}>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 30px)`,
          gridTemplateColumns: `repeat(${cols}, 30px)`,
          gap: 4,
          justifyContent: "center",
          marginBottom: 40,
          position: "relative",
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                border: "1px solid #ccc",
                background: "#fff",
              }}
            />
          ))
        )}
        {/* 刪除區 */}
        <div
          style={{
            position: "absolute",
            top: deleteArea.y,
            left: deleteArea.x,
            width: deleteArea.width,
            height: deleteArea.height,
            background: "rgba(255,0,0,0.2)",
            border: "2px dashed red",
            textAlign: "center",
            lineHeight: `${deleteArea.height}px`,
            fontWeight: "bold",
            color: "red",
          }}
        ></div>
        {/* 等腰三角形 */}
        {shapes.triangle && (
          <Draggable
            nodeRef={triangleRef}
            position={shapes.triangle}
            onStop={(_, d) => handleStop("triangle", d)}
          >
            <div
              ref={triangleRef}
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                borderLeft: "30px solid transparent",
                borderRight: "30px solid transparent",
                borderBottom: "60px solid white",
                cursor: "grab",
              }}
            />
          </Draggable>
        )}
        {/* 直角三角形（黃色） */}
        {shapes.rightTriangle && (
          <Draggable
            nodeRef={rightTriangleRef}
            position={shapes.rightTriangle}
            onStop={(_, d) => handleStop("rightTriangle", d)}
          >
            <div
              ref={rightTriangleRef}
              style={{
                position: "absolute",
                width: 60,
                height: 60,
                background: "yellow",
                clipPath: "polygon(0 0, 100% 0, 0 100%)", // 直角三角形
                cursor: "grab",
              }}
            />
          </Draggable>
        )}

        {/* 平行四邊形 */}
        {shapes.parallelogram && (
          <Draggable
            nodeRef={paraRef}
            position={shapes.parallelogram}
            onStop={(_, d) => handleStop("parallelogram", d)}
          >
            <div
              ref={paraRef}
              style={{
                position: "absolute",
                width: 60,
                height: 40,
                background: "red",
                transform: "skewX(-20deg)",
                cursor: "grab",
              }}
            />
          </Draggable>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <button onClick={() => addShape("triangle")} style={{ marginRight: 10 }}>
          新增三角形
        </button>
        <button onClick={() => addShape("parallelogram")} style={{ marginRight: 10 }}>
          新增平行四邊形
        </button>
        <button onClick={() => addShape("rightTriangle")} style={{ marginRight: 10 }}>
          新增直角三角形
        </button>
      </div>

      <h2 style={{ textAlign: "center" }}>mina (房間號碼 {room})</h2>

      {/* 表格 */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            width: "95vw",
            maxWidth: 400,
            overflow: "hidden",
          }}
        >
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#4f8cff",
                      color: "#fff",
                      padding: "12px 8px",
                    }}
                  >
                    in
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#4f8cff",
                      color: "#fff",
                      padding: "12px 8px",
                    }}
                  >
                    out
                  </th>
                  <th
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#4f8cff",
                      color: "#fff",
                      padding: "12px 8px",
                    }}
                  >
                    顏色
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((item, index) => (
                  <tr key={index}>
                    <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>
                      {item.in}
                    </td>
                    <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>
                      {item.out}
                    </td>
                    <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>
                      {item.color}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          display: "block",
          margin: "0 auto",
          padding: "10px 32px",
          fontSize: 16,
          background: "#ff7043",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        返回首頁
      </button>
    </div>
  );
}

export default MinaRoom;
