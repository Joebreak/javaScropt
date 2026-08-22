# javaScropt

多人連線桌遊前端（React），主程式位於 `my-app1`。

## 環境需求

- Node.js（建議 LTS 版本）
- npm

## 啟動開發伺服器

```bash
cd my-app1
npm install   # 第一次或依賴有變更時執行
npm start
```

啟動後瀏覽器通常會開啟：**http://localhost:3000**

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm start` | 啟動開發伺服器 |
| `npm run start:dev` | 開發模式啟動 |
| `npm run start:prd` | 以正式環境變數啟動 |
| `npm run build` | 打包建置 |
| `npm run build:prd` | 正式環境打包（含 GitHub Pages SPA 設定） |
| `npm test` | 執行測試 |

## 專案結構

```
javaScropt/
├── my-app1/          # React 應用程式
│   ├── src/
│   │   ├── App.jsx           # 登入頁
│   │   ├── routes.jsx        # 路由設定
│   │   ├── mine/             # 踩地雷
│   │   ├── hanabi/           # 花火
│   │   └── digitCode/        # 數字密碼
│   └── package.json
└── docs/             # API 文件
```

## 線上部署

正式環境：https://joebreak.github.io/javaScropt/
