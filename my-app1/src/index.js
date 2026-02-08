import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

const root = ReactDOM.createRoot(document.getElementById("root"));

// 從 PUBLIC_URL 獲取 basename（react-scripts 會自動從 homepage 設定）
// 本地開發時 PUBLIC_URL 通常是空字串，GitHub Pages 時會是 /javaScropt
const basename = process.env.PUBLIC_URL || '';

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);