import React from "react";

export default function RoomList({ data }) {
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
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>in</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>out</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>顏色</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>{item.in}</td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>{item.out}</td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea" }}>{item.color}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
