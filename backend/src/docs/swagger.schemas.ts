/**
 * @swagger
 * components:
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, fail]
 *           description: API 響應狀態
 *         message:
 *           type: string
 *           description: 響應消息（成功提示或錯誤消息）
 *         data:
 *           type: object
 *           description: 響應數據
 *         errorCode:
 *           type: string
 *           description: 錯誤代碼（僅在失敗時出現）
 *
 *     PopularMovie:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - posterPath
 *         - releaseDate
 *         - popularity
 *       properties:
 *         id:
 *           type: integer
 *           description: 電影ID
 *           example: 12345
 *         title:
 *           type: string
 *           description: 電影標題
 *           example: "玩具總動員 4"
 *         posterPath:
 *           type: string
 *           nullable: true
 *           description: 海報圖片路徑
 *           example: "/9TXzaOhPy1ub2OfzdyQJ0V5IEY7.jpg"
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: 上映日期
 *           example: "2024-01-01"
 *         popularity:
 *           type: number
 *           format: float
 *           description: 熱門程度
 *           example: 123.45
 *     
 *     SearchMovie:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - originalTitle
 *         - posterPath
 *         - releaseDate
 *       properties:
 *         id:
 *           type: integer
 *           description: 電影ID
 *           example: 634649
 *         title:
 *           type: string
 *           description: 電影標題（國語）
 *           example: "蜘蛛人：無家日"
 *         originalTitle:
 *           type: string
 *           description: 原始標題
 *           example: "Spider-Man: No Way Home"
 *         posterPath:
 *           type: string
 *           nullable: true
 *           description: 海報圖片路徑
 *           example: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: 上映日期
 *           example: "2021-12-15"
 * 
 *     MovieDetail:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - poster_path
 *         - release_date
 *         - popularity
 *       properties:
 *         id:
 *           type: integer
 *           description: 電影ID
 *           example: 634649
 *         title:
 *           type: string
 *           description: 電影標題
 *           example: "蜘蛛人：無家日"
 *         poster_path:
 *           type: string
 *           description: 海報圖片路徑
 *           example: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *         release_date:
 *           type: string
 *           format: date
 *           description: 上映日期
 *           example: "2021-12-15"
 *         popularity:
 *           type: number
 *           description: 熱門程度
 *           example: 123.45
 *         original_title:
 *           type: string
 *           nullable: true
 *           description: 原始標題
 *           example: "Spider-Man: No Way Home"
 *         original_language:
 *           type: string
 *           nullable: true
 *           description: 原始語言
 *           example: "en"
 *         overview:
 *           type: string
 *           nullable: true
 *           description: 電影簡介
 *           example: "彼得帕克在揭露自己是蜘蛛人的真實身分後..."
 *         backdrop_path:
 *           type: string
 *           nullable: true
 *           description: 背景圖片路徑
 *           example: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *         vote_average:
 *           type: number
 *           nullable: true
 *           description: 平均評分
 *           example: 8.5
 *         vote_count:
 *           type: integer
 *           nullable: true
 *           description: 評分人數
 *           example: 1000
 *         adult:
 *           type: boolean
 *           description: 是否為成人內容
 *           example: false
 *         video:
 *           type: boolean
 *           description: 是否有影片
 *           example: false
 *         genres:
 *           type: array
 *           description: 電影類型詳細資訊（已轉換為中文）
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 28
 *               name:
 *                 type: string
 *                 example: "動作"
 *         budget:
 *           type: integer
 *           description: 製作預算(美元)
 *           example: 200000000
 *         revenue:
 *           type: integer
 *           description: 票房收入(美元)
 *           example: 1000000000
 *         runtime:
 *           type: integer
 *           description: 片長(分鐘)
 *           example: 148
 *         belongs_to_collection:
 *           type: object
 *           nullable: true
 *           description: 電影系列資訊
 *         production_companies:
 *           type: array
 *           description: 製作公司
 *           items:
 *             type: object
 *         production_countries:
 *           type: array
 *           description: 製作國家
 *           items:
 *             type: object
 *         spoken_languages:
 *           type: array
 *           description: 電影語言
 *           items:
 *             type: object
 *         origin_country:
 *           type: array
 *           description: 原產國
 *           items:
 *             type: string
 * 
 *     RatingResponse:
 *       type: object
 *       required:
 *         - movieId
 *         - score
 *         - averageScore
 *         - totalVotes
 *       properties:
 *         movieId:
 *           type: integer
 *           example: 634649
 *         score:
 *           type: integer
 *           example: 8
 *         averageScore:
 *           type: number
 *           example: 8.5
 *         totalVotes:
 *           type: integer
 *           example: 1000
*/