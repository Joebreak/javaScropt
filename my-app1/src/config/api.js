// API 配置
const API_CONFIG = {
  // 正式環境
  prd: {
    cloudflare_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/room/',
    cloudflare_all_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/all_room',
    // Cloudflare Durable Objects / Workers 總入口，用來交換資訊
    cloudflare_durable_url: 'https://cloudflare-workers-practice.g132565.workers.dev/',
  },
};

// 獲取完整的 API URL
export const getApiUrl = (key, customEnv = null) => {
  let env = customEnv || process.env.REACT_APP_ENV || 'dev';

  // 如果是 dev 環境，使用當前域名
  if (env === 'dev') {
    let currentOrigin = window.location.origin;

    // 移除 IP 地址，只保留域名
    if (currentOrigin.includes('://')) {
      const protocol = currentOrigin.split('://')[0];
      const hostname = window.location.hostname;

      currentOrigin = `${protocol}://${hostname}`;
    }

    const devConfig = {
      cloudflare_room_url: `${currentOrigin}:9080/api/d1/room/`,
      cloudflare_all_room_url: `${currentOrigin}:9080/api/d1/all_room`,
      // 本地 Cloudflare Durable Objects / Workers 入口，用來交換資訊
      cloudflare_durable_url: process.env.REACT_APP_CLOUDFLARE_DURABLE_URL || 'http://localhost:8787',
    };

    const url = devConfig[key];
    if (!url) {
      throw new Error(`API key "${key}" 不存在於環境 "${env}" 中`);
    }
    return url;
  }

  // 清理隱藏字符
  const config = API_CONFIG[env.trim()] || API_CONFIG.dev;

  const url = config[key];
  if (!url) {
    throw new Error(`API key "${key}" 不存在於環境 "${env}" 中`);
  }
  return url;
};


