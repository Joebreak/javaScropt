import React from "react";

export default function HanabiGameInfo({ list = [] }) {
  if (!list.length) return null;

  return (
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
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>#</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>動作</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>玩家</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center", fontWeight: "bold", color: "#666" }}>
                    {list.length - idx}
                  </td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>
                    {item.action || "未知動作"}
                  </td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>
                    {item.player || "未知玩家"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
