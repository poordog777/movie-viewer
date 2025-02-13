# 系統功能設計

## 功能清單

### 用戶類
- Google 帳號登入
- 登出
- 對電影評分(1~10分)

### 電影類
- 主頁顯示近期熱門電影(按上映日期排序，顯示30部)
- 搜尋特定電影(搜尋框，支援分頁)

## API 設計

### 🟢 公開 API（無須登入）

| Method | Endpoint | 說明 | 回應 |
|--------|----------|------|------|
| GET | /auth/google | Google OAuth 登入入口 | 重定向至 Google 登入頁面 |
| GET | /auth/google/callback | Google OAuth 回調（回傳 JWT） | { token: string } |
| GET | /movies/popular | 取得近期熱門電影（按上映日期排序） | { page: number, results: [{ id: number, title: string, posterPath: string, releaseDate: string, popularity: number }], total_pages: number, total_results: number } |
| GET | /movies/search?query=關鍵字&page=1 | 關鍵字搜尋電影 | { page: number, results: [{ id: number, title: string, posterPath: string, releaseDate: string }], total_pages: number, total_results: number } |
| GET | /movies/:movieId | 取得電影詳細資訊（包含平均評分） | { id: number, title: string, overview: string, posterPath: string, releaseDate: string, popularity: number, voteAverage: number, voteCount: number } |

### 🔒 需要 JWT 認證的 API
用戶請求時需帶上 `Authorization: Bearer <JWT Token>`

| Method | Endpoint | 說明 | 回應 |
|--------|----------|------|------|
| POST | /auth/logout | 登出 | { message: string } |
| POST | /movies/:movieId/rating | 評分電影（1~10分）| { message: string } |

## 開發順序

### 第 1 階段：用戶認證 & JWT
- [x] GET /auth/google（重定向到 Google OAuth）
- [x] GET /auth/google/callback（處理回調 + 回傳 JWT）
- [x] POST /auth/logout（登出）

### 第 2 階段：電影資料串接
- [x] GET /movies/popular（熱門電影，按上映日期排序）
- [x] GET /movies/search?query=關鍵字（搜尋電影，支援分頁）
- [ ] GET /movies/:movieId（電影詳細資訊，包含平均評分）

### 第 3 階段：評分功能（需驗證 JWT）
- [ ] POST /movies/:movieId/rating（評分電影）