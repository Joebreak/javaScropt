import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function MinaRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: incomingData, room } = location.state || {};

  const [data, setData] = useState(incomingData || null);


  useEffect(() => {
    if (!incomingData) {
      navigate("/");
      return
    }
    setData(prev => ({
      ...prev,
    }));
  }, [incomingData, navigate]);


  const rows = 8;
  const cols = 10;
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  );
  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#f7f7f7" }}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 30px)`,
          gridTemplateColumns: `repeat(${cols}, 30px)`,
          gap: 4,
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                border: "1px solid #ccc",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            ></div>
          ))
        )}
      </div>

      <h2
        style={{
          marginTop: 0,
          marginBottom: 16,
          color: "#333",
          textAlign: "center",
          letterSpacing: 2,
        }}
      >
        mina (房間號碼 {room})
      </h2>
      {/* 表格區塊：只有內容捲動，表頭固定 */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, width: "100%" }}>
        {/* 外層卡片容器（陰影、圓角） */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            width: "95vw",
            maxWidth: 400,
            overflow: "hidden",     // 讓圓角有效
          }}
        >
          {/* 內層卷軸容器（只讓內容捲） */}
          <div
            style={{
              maxHeight: 200,        // 想要的內容高度
              overflowY: "auto",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  {/* sticky 設在 th 上最穩 */}
                  <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>
                    in
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>
                    out
                  </th>
                  <th style={{ position: "sticky", top: 0, zIndex: 1, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>
                    顏色
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data.list) &&
                  data.list.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.in}</td>
                      <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.out}</td>
                      <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.color}</td>
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