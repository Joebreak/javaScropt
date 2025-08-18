// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Room from "./Room";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/room" element={<Room />} />
    </Routes>
  );
}
