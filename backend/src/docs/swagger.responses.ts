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
 *             properties:
 *               status:
 *                 type: string
 *                 example: fail
 *               message:
 *                 type: string
 *                 example: 請提供認證令牌
 *               errorCode:
 *                 type: string
 *                 enum: [AUTH_INVALID_TOKEN, AUTH_TOKEN_EXPIRED]
 *     
 *     BadRequest:
 *       description: 請求錯誤
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: fail
 *               message:
 *                 type: string
 *                 example: 請求資料格式錯誤
 *               errorCode:
 *                 type: string
 *                 example: INVALID_REQUEST_BODY
 */ 