# Movie Viewer

Movie Viewer 是一個現代化的電影評論平台，整合第三方 TMDB API 提供最新電影資訊，使用者可以透過 Google 帳號快速登入，瀏覽電影資訊並進行評論互動。

## 功能特點
- 整合 TMDB API 即時電影資訊
- 多種登入方式（一般登入 + Google OAuth 2.0）
- 電影評分與評論系統
- 個人化電影收藏清單
- 電影瀏覽模式
  * 主頁顯示近期熱門電影(評分高到低)
  * 搜尋特定電影(搜尋框)

## 使用技術 (Tech Stack)

### 後端技術 (Backend)
- Node.js + Express.js
- TypeScript
- dotenv（環境變數管理）
- Helmet（安全性防護）
- JWT + OAuth 2.0（身份驗證）
- Joi（請求資料驗證）
- Swagger（API 文檔）
- Morgan（日誌系統）

### 資料庫 (Database)
- PostgreSQL（關聯式資料庫）
  * 用戶資料管理
  * 電影資訊快取
  * 評分與評論
  * 收藏清單

### 資料庫工具
- Prisma（ORM for PostgreSQL）

### 前端技術 (Frontend)
- React.js
- TypeScript
- Material UI
- TMDB API 整合
- Google OAuth 2.0 整合

### 開發工具 (Development Tools)
- Nodemon（開發熱重載）
- Mocha（測試框架）
  * Chai（斷言庫）
  * Supertest（HTTP 測試）
  * Sinon（測試替身：mock、stub、spy）

### 部署環境 (Deployment)
- GitHub Actions（CI/CD）
- Vercel（前端部署）
- Railway（後端部署）

## 開始使用

### 環境要求
- Node.js >= 16
- PostgreSQL

### 安裝步驟
1. 克隆專案
```bash
git clone https://github.com/poordog777/movie-viewer.git
cd movie-viewer
```

2. 安裝依賴
```bash
# 後端
cd backend
npm install

# 前端
cd frontend
npm install
```

3. 環境設定
- 複製 `.env.example` 到 `.env`
- 設定必要的環境變數：
  - DATABASE_URL
  - JWT_SECRET
  - TMDB_API_KEY
  - GOOGLE_CLIENT_ID

4. 啟動開發服務器
```bash
# 後端
npm run dev

# 前端
npm start
```

## API 文檔
API 文檔使用 Swagger UI 提供，本地開發時可訪問：
http://localhost:3000/api-docs

## 專案結構
```bash
movie-viewer/
├── backend/              # 後端程式碼
│   ├── prisma/           # 資料庫 Schema
│   ├── src/              
│   │   ├── config/       # 配置檔案
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/   # 中間件
│   │   ├── routes/       # 路由定義
│   │   └── services/     # 業務邏輯
│   └── tests/            # 測試檔案
└── frontend/             # 前端程式碼
```

## 測試
```bash
# 運行所有測試
npm test

# 運行特定測試
npm run test:auth    # 認證相關測試