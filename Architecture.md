# 系統架構設計

## 整體架構

```mermaid
graph TD
    Client[前端] -->|API 請求| BFF[後端]
    BFF -->|認證/授權| Auth[認證服務]
    BFF -->|電影資訊| TMDB[TMDB API]
    BFF -->|數據存儲| PostgreSQL[(PostgreSQL)]
    Auth -->|OAuth| Google[Google OAuth]
```

## 資料庫架構設計

### PostgreSQL 架構

#### 1. Users 表
用戶基本資料和認證資訊
```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    google_id   VARCHAR(255) UNIQUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Movies 表
電影基本資訊快取
```sql
CREATE TABLE movies (
    id              INTEGER PRIMARY KEY,  -- TMDB movie_id
    title           VARCHAR(255) NOT NULL,
    overview        TEXT,
    poster_path     VARCHAR(255),
    release_date    DATE,
    popularity      FLOAT,
    vote_average    FLOAT,
    vote_count      INTEGER,
    cached_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_movies_popularity ON movies(popularity);
```

#### 3. Ratings 表
用戶對電影的評分
```sql
CREATE TABLE ratings (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id    INTEGER NOT NULL,
    score       SMALLINT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rating_score_range CHECK (score >= 1 AND score <= 10),
    UNIQUE(user_id, movie_id)
);

CREATE INDEX idx_ratings_user_movie ON ratings(user_id, movie_id);
CREATE INDEX idx_ratings_movie_score ON ratings(movie_id, score);
```

### 資料關係設計

1. User - Rating 關係
   - 一對多關係
   - CASCADE DELETE
   - 唯一約束確保一個用戶只能對一部電影評分一次

## 核心功能流程

### 1. 使用者認證流程

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Google
    participant DB

    User->>Frontend: 點擊 Google 登入
    Frontend->>Backend: GET /auth/google
    Backend->>Google: 重定向到 Google OAuth
    Google-->>Backend: GET /auth/google/callback (授權碼)
    Backend->>Google: 驗證並取得用戶資訊
    Backend->>DB: 添加用戶（若不存在）
    Backend->>Frontend: 回傳 JWT Token
```

### 2. 電影資訊處理流程

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB
    participant TMDB

    alt 熱門電影列表
        User->>Frontend: 訪問主頁
        Frontend->>Backend: 請求熱門電影
    else 電影詳情
        User->>Frontend: 點選熱門電影
        Frontend->>Backend: API 請求
    else 搜尋電影
        User->>Frontend: 搜尋關鍵字
        Frontend->>Backend: 發送搜尋請求(帶關鍵字)
    end

    alt 熱門電影列表
        Backend->>TMDB: 請求近期熱門電影
        TMDB->>Backend: 返回電影數據
        Backend->>Backend: 按上映日期排序取前30部
        Backend->>DB: 存入缺少的電影資料
    else 其他查詢
        Backend->>DB: 查詢 movies 表
        alt movies 表中存在
            DB->>Backend: 返回電影數據
        else 不存在
            Backend->>TMDB: 請求 TMDB API
            TMDB->>Backend: 返回電影數據
            Backend->>DB: 存入 movies 表
        end
    end
    
    alt 熱門電影列表
        Backend->>Frontend: 返回按上映日期排序的30部電影
    else 搜尋結果
        Backend->>Frontend: 返回符合關鍵字的電影
    else 電影詳情
        Backend->>Frontend: 返回單部電影詳情
    end
```

### 4. 用戶評分流程

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: 提交評分(1-10分)
    Frontend->>Backend: POST 評分請求（帶JWT）
    Backend->>Backend: 驗證JWT
    Backend->>DB: 儲存評分
    DB->>Backend: 確認儲存成功
    Backend->>Frontend: 返回成功訊息
```

## 技術選擇說明

1. 前端技術
   - React.js：組件化開發，豐富的生態系統
   - TypeScript：型別安全，更好的開發體驗
   - Material UI：快速構建一致的 UI 介面

2. 後端技術
   - Express.js：輕量級、靈活的 Node.js 框架
   - TypeScript：共用前端的型別定義
   - Prisma：類型安全的 ORM，自動生成類型

3. 環境配置架構
   - 雙環境設計：
     * Development：整合開發和測試環境，提供完整的開發功能
     * Production：專注於效能和穩定性的生產環境
   - 環境變數管理：
     * dotenv-cli：動態載入環境設定
     * 分離的配置檔案：.env.development 和 .env.production
   - 環境特性：
     * Development：
       - 詳細的日誌輸出
       - 支援測試和開發工具
       - 熱重載功能
     * Production：
       - 最小化日誌輸出
       - 效能優化設定
       - 強化的安全措施

4. 資料庫選擇
   - PostgreSQL：
     * 用戶數據：強一致性需求
     * 評分數據：關聯式查詢
     * 電影資訊快取：減少 API 調用

5. 安全性考慮
   - JWT + OAuth：安全的身份驗證
   - Helmet：HTTP 安全標頭
   - Rate Limiting：防止濫用
   - 資料驗證：使用 Joi 驗證所有輸入

6. 效能優化
   - 資料庫索引：
     * movies 表：release_date、popularity 索引
     * ratings 表：user_movie、movie_score 複合索引
   - 本地快取：使用 movies 表存儲電影資訊，減少 TMDB API 調用
   - API 響應壓縮：減少傳輸大小