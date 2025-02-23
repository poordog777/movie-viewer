# 系統功能設計

## 功能清單

### 用戶類
- Google 帳號登入
- 登出
- 對電影評分(1~10分)

### 電影類
- 主頁顯示近期熱門電影(顯示30部)
- 搜尋特定電影(搜尋框，支援分頁)

## API 設計

### 🟢 公開 API（無須登入）

| Method | Endpoint | 說明 | 回應 |
|--------|----------|------|------|
| GET | /auth/google | Google OAuth 登入入口 | 重定向至 Google 登入頁面 |
| GET | /auth/google/callback | Google OAuth 回調（回傳 JWT） | { token: string } |
| GET | /movies/popular | 取得近期熱門電影（每3小時更新） | { status: "success", data: { page: number, results: [{ id: number, title: string, poster_path: string, release_date: string, popularity: number }], total_pages: number, total_results: number } } |
| GET | /movies/search?query=關鍵字&page=1 | 關鍵字搜尋電影 | { status: "success", data: { page: number, results: [{ id: number, title: string, original_title: string, poster_path: string, release_date: string }], total_pages: number, total_results: number } } |
| GET | /movies/:movieId | 取得電影詳細資訊（包含平均評分） | { status: "success", data: TMDB API 回傳資料，但 genres 欄位會轉換為中文 } |

### 🔒 需要 JWT 認證的 API
用戶請求時需帶上 `Authorization: Bearer <JWT Token>`

| Method | Endpoint | 說明 | 請求/回應 |
|--------|----------|------|------|
| POST | /auth/logout | 登出 | { status: "success", message: string } |
| POST | /movies/:movieId/rating | 評分電影（1~10分）| Request Body: { score: number }<br>Response: { status: "success", message: "評分成功", data: { movie_id: number, score: number, average_score: number, total_votes: number } } |

### 統一響應格式

所有 API 響應都遵循以下格式：

```typescript
interface ApiResponse<T = any> {
  // API 響應狀態
  status: 'success' | 'fail';
  
  // 響應消息（用於成功提示或錯誤說明）
  message?: string;
  
  // 響應數據
  data?: T;
  
  // 錯誤代碼（當 status 為 fail 時使用）
  errorCode?: string;
}
```

### 響應範例

#### 成功響應 - 電影列表
```json
{
  "status": "success",
  "data": {
    "page": 1,
    "results": [
      {
        "id": 123,
        "title": "電影標題",
        "poster_path": "/path/to/poster.jpg",
        "release_date": "2024-02-19",
        "popularity": 8.5
      }
    ],
    "total_pages": 5,
    "total_results": 100
  }
}
```

#### 成功響應 - 評分
```json
{
  "status": "success",
  "message": "評分成功",
  "data": {
    "movie_id": 123,
    "score": 8,
    "average_score": 8.5,
    "total_votes": 100
  }
}
```

#### 錯誤響應
```json
{
  "status": "fail",
  "message": "找不到指定的電影",
  "errorCode": "MOVIE_NOT_FOUND"
}
```

常見錯誤碼：
- 401 Unauthorized: 未授權訪問或 TMDB API 驗證失敗
- 404 Not Found: 找不到電影資源
- 429 Too Many Requests: TMDB API 請求次數超限
- 500 Internal Server Error: 伺服器內部錯誤

## 開發順序

### 第 1 階段：用戶認證 & JWT
- [x] GET /auth/google（重定向到 Google OAuth）
- [x] GET /auth/google/callback（處理回調 + 回傳 JWT）
- [x] POST /auth/logout（登出）

### 第 2 階段：電影資料串接
- [x] GET /movies/popular（熱門電影，按上映日期排序）
- [x] GET /movies/search?query=關鍵字（搜尋電影，支援分頁）
- [x] GET /movies/:movieId（電影詳細資訊，包含平均評分）

### 第 3 階段：評分功能（需驗證 JWT）
- [x] POST /movies/:movieId/rating（評分電影）