# Movie Viewer

Movie Viewer 是一個現代化的電影評論平台，整合第三方 TMDB API 提供最新電影資訊，使用者可以透過 Google 帳號快速登入，瀏覽電影資訊並進行評論互動。

## 使用技術 (Tech Stack)

### 後端技術 (Backend)
- Node.js + Express.js
- TypeScript
- Helmet（安全性防護）
- JWT + OAuth 2.0（身份驗證）
- Swagger（API 文檔）
- Morgan（日誌系統）

### 資料庫 (Database)
#### PostgreSQL（關聯式資料庫）
- 用戶資料管理
- 評分記錄
- 收藏清單

#### MongoDB（文件資料庫）
- 電影資訊快取
- 評論資料儲存

### 資料庫工具
- Prisma（ORM for PostgreSQL）
- Mongoose（ODM for MongoDB）

### 前端技術 (Frontend)
- React.js
- TypeScript
- TMDB API 整合
- Google OAuth 2.0 整合

### 開發工具 (Development Tools)
- ESLint + Prettier（程式碼規範）
- Nodemon（開發熱重載）
- Mocha（測試框架）

### 部署環境 (Deployment)
- GitHub Actions（CI/CD）
- Vercel（前端部署）
- Railway（後端部署）