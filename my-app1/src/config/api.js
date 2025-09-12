// API 配置
const API_CONFIG = {
  // 本地開發環境
  dev: {
    boxUrl: 'http://192.168.0.213:20218/api/admin/voter/visitRecord/2',
    cloudflare_list_url: 'http://127.0.0.1:9080/api/d1/list',
    cloudflare_update_url: 'http://127.0.0.1:9080/api/d1/1',
  },
  // 正式環境
  prd: {
    boxUrl: 'https://voter.dev.box70000.com/api/admin/voter/visitRecord/2',
    cloudflare_list_url: 'https://web-server-api.g132565.workers.dev/api/d1/list',
    cloudflare_update_url: 'https://web-server-api.g132565.workers.dev/api/d1/1',
  },
};

// 獲取完整的 API URL
export const getApiUrl = (key, customEnv = null) => {
  // 如果有傳入自定義環境，使用自定義環境；否則使用預設環境
  const env = customEnv || process.env.NODE_ENV || 'dev';
  const config = API_CONFIG[env] || API_CONFIG.dev;
  
  const url = config[key];
  if (!url) {
    throw new Error(`API key "${key}" 不存在於環境 "${env}" 中`);
  }
  return url;
};


