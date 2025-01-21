/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         name:
 *           type: string
 *           example: "測試用戶"
 *         email:
 *           type: string
 *           example: "test@example.com"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: 操作成功
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: fail
 *         message:
 *           type: string
 *           example: 操作失敗
 *         errorCode:
 *           type: string
 *           example: INVALID_REQUEST_BODY
 *   
 *   responses:
 *     NotFound:
 *       description: 找不到資源
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     
 *     Unauthorized:
 *       description: 未授權訪問
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */ 