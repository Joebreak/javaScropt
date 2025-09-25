import React from "react";

export default function DigitCodeList({ data }) {
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
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>問題類型</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>in</th>
                <th style={{ position: "sticky", top: 0, background: "#4f8cff", color: "#fff", padding: "12px 8px" }}>out</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center", fontWeight: "bold", color: "#666" }}>{item.round}</td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>{item.type}</td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>{item.in}</td>
                  <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", textAlign: "center" }}>{item.out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
