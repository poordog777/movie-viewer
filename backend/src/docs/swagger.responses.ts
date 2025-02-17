/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: 未授權訪問
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: '請先登入'
 *               errorCode:
 *                 type: string
 *                 enum: [AUTH_INVALID_TOKEN, AUTH_TOKEN_EXPIRED]
 *                 example: AUTH_INVALID_TOKEN
 *     
 *     ValidationError:
 *       description: 請求參數驗證失敗
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: '無效的請求參數'
 *               errorCode:
 *                 type: string
 *                 example: INVALID_REQUEST_BODY
 * 
 *     MovieNotFound:
 *       description: 找不到電影
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: '找不到該電影'
 *               errorCode:
 *                 type: string
 *                 example: MOVIE_NOT_FOUND
 * 
 *     ExternalAPIError:
 *       description: 外部 API 請求錯誤
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: 'TMDB API 請求失敗'
 *               errorCode:
 *                 type: string
 *                 example: EXTERNAL_API_ERROR
 * 
 *     TMDBUnauthorized:
 *       description: TMDB API 驗證失敗
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: 'TMDB API 驗證失敗'
 *               errorCode:
 *                 type: string
 *                 example: EXTERNAL_API_ERROR
 * 
 *     TMDBRateLimit:
 *       description: TMDB API 請求次數超限
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - message
 *               - errorCode
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [fail]
 *               message:
 *                 type: string
 *                 example: 'TMDB API 請求次數超限'
 *               errorCode:
 *                 type: string
 *                 example: EXTERNAL_API_ERROR
*/