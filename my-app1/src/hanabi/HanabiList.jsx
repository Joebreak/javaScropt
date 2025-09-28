import React from "react";
import { 
  getColorChineseName, 
  getActionTypeChineseName 
} from "./gameData";

export default function HanabiList({ data }) {
  // 如果沒有資料或 list 為空，顯示表格標題但無內容
  const hasData = data && data.list && data.list.length > 0;

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
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>目標玩家</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>提示內容</th>
              </tr>
            </thead>
            <tbody>
              {hasData && data.list.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center", fontWeight: "bold", color: "#666" }}>
                    {data.list.length - idx}
                  </td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>
                    {getActionTypeChineseName(item.type)}
                  </td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>
                    {item.player || ""}
                  </td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>
                    {item.type === 1 ? 
                      getColorChineseName(item.out) : 
                      item.out || "未知內容"}
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
