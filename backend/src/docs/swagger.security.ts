/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         使用方式：
 *         1. 透過 Google OAuth 登入取得 JWT Token
 *         2. 點擊此處的 Authorize 按鈕
 *         3. 直接輸入 JWT Token（不需要加 Bearer 前綴）
 *         4. 點擊 Authorize 確認
 *         
 *         範例 Token：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*/