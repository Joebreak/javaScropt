// 伺服器配置
const config = {
  // 伺服器設定
  server: {
    port: process.env.PORT || 9091,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'dev'
  },
  
  // 資料庫設定
  database: {
    host: process.env.DB_HOST || '',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true
  },
  
  // API 設定
  api: {
    basePath: '/api',
    timeout: 10000
  }
};

module.exports = config;
