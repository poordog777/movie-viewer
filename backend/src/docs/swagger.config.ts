/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Movie Viewer API
 *   version: 1.0.0
 *   description: |
 *     電影評論平台 API 文檔
 *     
 *     主要功能：
 *     - Google OAuth 登入/登出
 *     - 瀏覽近期熱門電影
 *     - 搜尋特定電影
 *     - 查看電影詳情
 *     - 為電影評分(1-10分)
 *     
 *     使用說明：
 *     1. 先使用 Google OAuth 登入取得 JWT Token
 *     2. 需要認證的 API 請在 Authorize 中填入 JWT Token
 * servers:
 *   - url: http://localhost:3000
 *     description: 開發環境
 *   - url: https://api.movieviewer.example.com
 *     description: 生產環境
*/