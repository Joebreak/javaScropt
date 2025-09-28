// 花火遊戲基本配置設置

// 顏色常數
export const COLOR_KEYS = {
  RED: 'RED',
  GREEN: 'GREEN',
  BLUE: 'BLUE',
  YELLOW: 'YELLOW',
  WHITE: 'WHITE'
};

// 顏色數字映射 (API 用)
export const COLOR_NUMBER_MAP = {
  'RED': 1,
  'GREEN': 2,
  'BLUE': 3,
  'YELLOW': 4,
  'WHITE': 5
};


// 顏色中文名稱映射
export const COLOR_CHINESE_MAP = {
  'RED': '紅色',
  'GREEN': '綠色',
  'BLUE': '藍色',
  'YELLOW': '黃色',
  'WHITE': '白色'
};

// 顏色樣式映射
export const COLOR_STYLE_MAP = {
  'RED': { backgroundColor: 'crimson', color: '#fff' },
  'GREEN': { backgroundColor: 'seagreen', color: '#fff' },
  'BLUE': { backgroundColor: 'royalblue', color: '#fff' },
  'YELLOW': { backgroundColor: 'goldenrod', color: '#fff' },
  'WHITE': { backgroundColor: 'lightgray', color: '#000' }
};

// 顏色選項 (用於提示系統)
export const COLOR_OPTIONS = [
  { value: 'RED', label: '紅色', color: 'crimson' },
  { value: 'GREEN', label: '綠色', color: 'seagreen' },
  { value: 'BLUE', label: '藍色', color: 'royalblue' },
  { value: 'YELLOW', label: '黃色', color: 'goldenrod' },
  { value: 'WHITE', label: '白色', color: 'lightgray' }
];

// 數字選項 (用於提示系統)
export const NUMBER_OPTIONS = [1, 2, 3, 4, 5];

// 動作類型常數
export const ACTION_TYPES = {
  HINT_COLOR: 1,    // 提示顏色
  HINT_NUMBER: 2,   // 提示數字
  PLAY_CARD: 3,     // 出牌
  DISCARD_CARD: 4   // 棄牌
};

// 動作類型中文映射
export const ACTION_TYPE_CHINESE_MAP = {
  1: '提示顏色',
  2: '提示數字',
  3: '出牌到煙火',
  4: '出牌到棄牌堆'
};

// 工具函數：將顏色轉換為數字
export const getColorValue = (color) => {
  return COLOR_NUMBER_MAP[color] || 0;
};


// 工具函數：獲取顏色中文名稱
export const getColorChineseName = (color) => {
  return COLOR_CHINESE_MAP[color] || color;
};

// 工具函數：獲取顏色樣式
export const getColorStyle = (color) => {
  return COLOR_STYLE_MAP[color] || { backgroundColor: '#ddd', color: '#999' };
};

// 工具函數：獲取動作類型中文名稱
export const getActionTypeChineseName = (type) => {
  return ACTION_TYPE_CHINESE_MAP[type] || '未知動作';
};
