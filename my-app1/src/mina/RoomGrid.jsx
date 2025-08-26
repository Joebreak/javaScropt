import React, { useState, useRef } from "react";
import Draggable from "react-draggable";

// 圖形設定
const SHAPE_CONFIG = {
  triangle: { size: [60, 60], color: "red", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" },
  rightTriangle: { size: [60, 60], color: "yellow", clipPath: "polygon(0 0, 100% 0, 0 100%)" },
  parallelogram: { size: [90, 60], color: "blue", clipPath: "polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%)" },
};

function RoomGrid({ rows = 8, cols = 10 }) {
  // 初始格子
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));

  // 圖形位置與旋轉
  const [shapes, setShapes] = useState({
    triangle: loadPos("triangle-pos"),
    rightTriangle: loadPos("right-triangle-pos"),
    parallelogram: loadPos("para-pos"),
  });

  // Ref 預先創建好
  const triangleRef = useRef(null);
  const rightTriangleRef = useRef(null);
  const parallelogramRef = useRef(null);
  const shapeRefs = { triangle: triangleRef, rightTriangle: rightTriangleRef, parallelogram: parallelogramRef };

  function loadPos(key) {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }

  const handleStop = (type, e, data) => {
    const pos = { x: data.x, y: data.y, rotation: shapes[type]?.rotation || 0 };
    setShapes((prev) => ({ ...prev, [type]: pos }));
    localStorage.setItem(keyToStorage(type), JSON.stringify(pos));
  };

  const rotateShape = (type) => {
    setShapes((prev) => {
      const s = prev[type];
      if (!s) return prev;
      const newRot = ((s.rotation || 0) + 90) % 360;
      const newShape = { ...s, rotation: newRot };
      localStorage.setItem(keyToStorage(type), JSON.stringify(newShape));
      return { ...prev, [type]: newShape };
    });
  };

  const keyToStorage = (type) => {
    if (type === "triangle") return "triangle-pos";
    if (type === "rightTriangle") return "right-triangle-pos";
    if (type === "parallelogram") return "para-pos";
  };

  const addShape = (type) => {
    if (!shapes[type]) {
      const initPos = { x: 0, y: 0, rotation: 0 };
      setShapes((prev) => ({ ...prev, [type]: initPos }));
      localStorage.setItem(keyToStorage(type), JSON.stringify(initPos));
    }
  };

  const removeShape = (type) => {
    setShapes((prev) => ({ ...prev, [type]: null }));
    localStorage.removeItem(keyToStorage(type));
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10, textAlign: "center" }}>
        {Object.keys(SHAPE_CONFIG).map((type) => (
          <React.Fragment key={type}>
            <button onClick={() => addShape(type)} style={{ marginRight: 6 }}>新增 {type}</button>
            <button onClick={() => removeShape(type)} style={{ marginRight: 6 }}>刪除 {type}</button>
          </React.Fragment>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 30px)`,
          gridTemplateColumns: `repeat(${cols}, 30px)`,
          gap: 4,
          justifyContent: "center",
          position: "relative",
          minHeight: 200,
          marginBottom: 20,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                border: "1px solid #ccc",
                background: "#fff",
                width: 30,
                height: 30,
              }}
            />
          ))
        )}

        {Object.keys(SHAPE_CONFIG).map((type) => {
          const s = shapes[type];
          if (!s) return null;
          const cfg = SHAPE_CONFIG[type];
          const nodeRef = shapeRefs[type];

          return (
            <Draggable key={type} nodeRef={nodeRef} position={{ x: s.x, y: s.y }} onStop={(e, d) => handleStop(type, e, d)}>
              <div
                ref={nodeRef}
                style={{
                  position: "absolute",
                  width: cfg.size[0],
                  height: cfg.size[1],
                  transform: `rotate(${s.rotation || 0}deg)`,
                  cursor: "grab",
                }}
              >
                <div style={{ width: "100%", height: "100%", background: cfg.color, clipPath: cfg.clipPath }} />
                <button
                  onClick={(e) => { e.stopPropagation(); rotateShape(type); }}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border: "none",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  🔄
                </button>
              </div>
            </Draggable>
          );
        })}
      </div>
    </div>
  );
}

export default RoomGrid;
