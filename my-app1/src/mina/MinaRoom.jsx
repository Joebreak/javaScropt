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
  return (
    <div style={{ padding: 20, textAlign: "center", background: "#f7f7f7", minHeight: "100vh" }}>
      <h2 style={{ marginTop: 32, color: "#333", letterSpacing: 2 }}>mina(房間號碼 {room})</h2>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "24px 0", width: "100%" }}>
        <table style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          borderCollapse: "collapse",
          width: "95vw",
          maxWidth: 400,
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ background: "#4f8cff", color: "#fff" }}>
              <th style={{ padding: "12px 8px" }}>in</th>
              <th style={{ padding: "12px 8px" }}>out</th>
              <th style={{ padding: "12px 8px" }}>顏色</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.list) && data.list.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.in}</td>
                <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.out}</td>
                <td style={{ padding: "12px 8px", borderTop: "1px solid #eaeaea", color: "#444" }}>{item.color}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 20,
          padding: "10px 32px",
          fontSize: 16,
          background: "#ff7043",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        返回首頁
      </button>
    </div>
  );
}