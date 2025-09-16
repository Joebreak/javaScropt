// API 配置
const API_CONFIG = {
  // 本地開發環境
  dev: {
    boxUrl: 'http://192.168.0.213:20218/api/admin/voter/visitRecord/2',
    cloudflare_list_url: 'http://127.0.0.1:9080/api/d1/list',
    cloudflare_update_url: 'http://127.0.0.1:9080/api/d1/1',
    cloudflare_room_url: 'http://127.0.0.1:9080/api/d2/room/',
  },
  // 正式環境
  prd: {
    boxUrl: 'https://voter.dev.box70000.com/api/admin/voter/visitRecord/2',
    cloudflare_list_url: 'https://web-server-api.g132565.workers.dev/api/d1/list',
    cloudflare_update_url: 'https://web-server-api.g132565.workers.dev/api/d1/1',
    cloudflare_room_url: 'https://web-server-api.g132565.workers.dev/api/d2/room/',
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


