# 系統功能設計

## 功能清單

### 用戶類
- Google 帳號登入
- 登出
- 收藏電影
- 對電影評分(1~5)
- 對電影評論

### 電影類
- 主頁顯示近期熱門電影(評分高到低)
- 搜尋特定電影(搜尋框)

## API 設計

### 🟢 公開 API（無須登入）

| Method | Endpoint | 說明 |
|--------|----------|------|
| GET | /auth/google | Google OAuth 登入入口 |
| GET | /auth/google/callback | Google OAuth 回調（回傳 JWT） |
| GET | /movies/popular | 取得近期熱門電影（評分高到低） |
| GET | /movies/search?q= | 關鍵字搜尋電影 |

### 🔒 需要 JWT 認證的 API
用戶請求時需帶上 `Authorization: Bearer <JWT Token>`

| Method | Endpoint | 說明 |
|--------|----------|------|
| POST | /auth/logout | 登出 |
| GET | /movies/favorites | 取得用戶收藏的所有電影 |
| POST | /movies/:movieId/favorite | 收藏電影 |
| DELETE | /movies/:movieId/favorite | 取消收藏 |
| GET | /movies/:movieId/rating | 取得電影評分 |
| POST | /movies/:movieId/rating | 評分電影（1~5分） |
| GET | /movies/:movieId/reviews | 取得電影評論 |
| POST | /movies/:movieId/review | 新增評論 |

## 開發順序

### 第 1 階段：用戶認證 & JWT
- [x] GET /auth/google（重定向到 Google OAuth）
- [x] GET /auth/google/callback（處理回調 + 回傳 JWT）
- [x] POST /auth/logout（登出）

### 第 2 階段：電影資料串接
- [ ] GET /movies/popular（熱門電影）
- [ ] GET /movies/search?q=關鍵字（搜尋電影）

### 第 3 階段：用戶功能（需驗證 JWT）
- [ ] GET  /movies/favorites（取得用戶收藏的所有電影）
- [ ] POST /movies/:movieId/favorite（收藏電影）
- [ ] DELETE /movies/:movieId/favorite（取消收藏）
- [ ] POST /movies/:movieId/rating（評分電影）
- [ ] GET /movies/:movieId/rating（取得電影評分）
- [ ] POST /movies/:movieId/review（新增評論）
- [ ] GET /movies/:movieId/reviews（取得評論）