// src/routes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Room from "./Room/Room";
import MinaRoom from "./mina/MinaRoom";
import HanabiRoom from "./hanabi/HanabiRoom";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/room" element={<Room />} />
      <Route path="/mina" element={<MinaRoom />} />
      <Route path="/hanabi" element={<HanabiRoom />} />
    </Routes>
  );
}
