import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";

const root = ReactDOM.createRoot(document.getElementById("root"));

// CRA：homepage 在 package.json 時，PUBLIC_URL=/repoName（勿尾隨 /），否則子路徑路由會掛掉
const routerBasename =
  (process.env.PUBLIC_URL && process.env.PUBLIC_URL.replace(/\/$/, "")) || "";

root.render(
  <React.StrictMode>
    <BrowserRouter basename={routerBasename}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);