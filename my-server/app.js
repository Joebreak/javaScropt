const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const config = require('./config');
require('dotenv').config();

const app = express();

// 中間件
app.use(cors());
app.use(express.json());

// 資料庫連接設定
const dbConfig = config.database;

// 建立資料庫連接池
const pool = mysql.createPool(dbConfig);

// 測試資料庫連接
console.log('🔗 正在測試資料庫連接...');

// 模擬 Cloudflare D1 房間（Cannot Stop 等）：GET/POST /api/d1/room/:room
const d1RoomRoutes = require('./d1RoomRoutes');
app.use('/api/d1/room', d1RoomRoutes);

// MySQL 查詢 API
app.get('/api/mysql/test', async (req, res) => {
  try {
    // 使用 Promise 方式執行查詢
    const [rows] = await pool.promise().execute('SELECT * FROM visitRecord');
    res.json({
      success: true,
      message: '查詢成功',
      data: rows,
      totalCount: rows.length
    });
  } catch (error) {
    console.error('查詢失敗:', error);
    res.status(500).json({
      success: false,
      message: '查詢失敗',
      error: error.message
    });
  }
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: err.message
  });
});

// 404 處理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端點不存在',
    path: req.originalUrl
  });
});

// 啟動伺服器
app.listen(config.server.port, config.server.host, () => {
  console.log(`🚀 伺服器運行在 http://${config.server.host}:${config.server.port}`);
  console.log(`🗄️  MySQL 查詢: http://${config.server.host}:${config.server.port}${config.api.basePath}/mysql/test`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉伺服器...');
  pool.end(() => {
    console.log('資料庫連接已關閉');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在關閉伺服器...');
  pool.end(() => {
    console.log('資料庫連接已關閉');
    process.exit(0);
  });
});
