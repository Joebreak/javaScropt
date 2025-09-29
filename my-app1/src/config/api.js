// API 配置
const API_CONFIG = {
  // 正式環境
  prd: {
    cloudflare_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/room/',
    cloudflare_all_room_url: 'https://web-server-api.g132565.workers.dev/api/d1/all_room',
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


