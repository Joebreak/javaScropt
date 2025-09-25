import React from 'react';

// 0-9 數字面板組件
export default function NumberPanel({ digitIndex, isMobileView, selectedSegments, onNumberClick }) {
  // 獲取數字狀態 (0: 無標記, -1: X)
  const getNumState = (num) => {
    return selectedSegments[`num${digitIndex}-${num}`] || 0;
  };

  // 切換數字狀態 (0 <-> -1)
  const handleNumClick = (num) => {
    const key = `num${digitIndex}-${num}`;
    const current = selectedSegments[key] || 0;
    const next = current === -1 ? 0 : -1;
    onNumberClick(key, next);
  };

  const size = isMobileView ? 20 : 24;

  if (isMobileView) {
    // 手機版：0-9 面板在下方
    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: 6,
        zIndex: 15
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[0, 2, 4, 6, 8].map((n) => {
            const st = getNumState(n);
            return (
              <button
                key={`m-col-even-${n}`}
                onClick={() => handleNumClick(n)}
                style={{
                  width: size,
                  height: size,
                  fontSize: size * 0.6,
                  background: st === -1 ? "#e74c3c" : "#f8f9fa",
                  color: st === -1 ? "white" : "#333",
                  border: st === -1 ? "2px solid #c0392b" : "2px solid #dee2e6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {st === -1 ? "✕" : n}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, 3, 5, 7, 9].map((n) => {
            const st = getNumState(n);
            return (
              <button
                key={`m-col-odd-${n}`}
                onClick={() => handleNumClick(n)}
                style={{
                  width: size,
                  height: size,
                  fontSize: size * 0.6,
                  background: st === -1 ? "#e74c3c" : "#f8f9fa",
                  color: st === -1 ? "white" : "#333",
                  border: st === -1 ? "2px solid #c0392b" : "2px solid #dee2e6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {st === -1 ? "✕" : n}
              </button>
            );
          })}
        </div>
      </div>
    );
  } else {
    // 網頁版：0-9 面板在右側，使用 flexbox 布局
    return (
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: 6,
        zIndex: 15
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[0, 2, 4, 6, 8].map((n) => {
            const st = getNumState(n);
            return (
              <button
                key={`d-col-even-${n}`}
                onClick={() => handleNumClick(n)}
                style={{
                  width: size,
                  height: size,
                  fontSize: size * 0.6,
                  background: st === -1 ? "#e74c3c" : "#f8f9fa",
                  color: st === -1 ? "white" : "#333",
                  border: st === -1 ? "2px solid #c0392b" : "2px solid #dee2e6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {st === -1 ? "✕" : n}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[1, 3, 5, 7, 9].map((n) => {
            const st = getNumState(n);
            return (
              <button
                key={`d-col-odd-${n}`}
                onClick={() => handleNumClick(n)}
                style={{
                  width: size,
                  height: size,
                  fontSize: size * 0.6,
                  background: st === -1 ? "#e74c3c" : "#f8f9fa",
                  color: st === -1 ? "white" : "#333",
                  border: st === -1 ? "2px solid #c0392b" : "2px solid #dee2e6",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}
              >
                {st === -1 ? "✕" : n}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}