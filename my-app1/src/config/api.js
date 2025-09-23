// API 配置
const API_CONFIG = {
  // 本地開發環境
  dev: {
    cloudflare_room_url: 'http://127.0.0.1:9080/api/d1/room/',
    cloudflare_all_room_url: 'http://127.0.0.1:9080/api/d1/all_room',
  },
  // 正式環境
  prd: {
    cloudflare_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/room/',
    cloudflare_all_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/all_room',
  },
};

// 獲取完整的 API URL
export const getApiUrl = (key, customEnv = null) => {
  let env = customEnv || process.env.REACT_APP_ENV || 'dev';
  // 清理隱藏字符
  const config = API_CONFIG[env.trim()] || API_CONFIG.dev;

  const url = config[key];
  if (!url) {
    throw new Error(`API key "${key}" 不存在於環境 "${env}" 中`);
  }
  return url;
};


