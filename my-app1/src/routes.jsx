// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import MineRoom from "./mine/MineRoom";
import HanabiRoom from "./hanabi/HanabiRoom";
import DigitCodeRoom from "./digitCode/DigitCodeRoom";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/mine" element={<MineRoom />} />
      <Route path="/hanabi" element={<HanabiRoom />} />
      <Route path="/digitCode" element={<DigitCodeRoom />} />
    </Routes>
  );
}
