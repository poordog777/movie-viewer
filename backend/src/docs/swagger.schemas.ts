/**
 * @swagger
 * components:
 *   schemas:
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
 *         - overview
 *         - posterPath
 *         - releaseDate
 *         - popularity
 *         - voteAverage
 *         - voteCount
 *       properties:
 *         id:
 *           type: integer
 *           description: 電影ID
 *           example: 634649
 *         title:
 *           type: string
 *           description: 電影標題
 *           example: "蜘蛛人：無家日"
 *         overview:
 *           type: string
 *           description: 電影簡介
 *           example: "彼得帕克在揭露自己是蜘蛛人的真實身分後..."
 *         posterPath:
 *           type: string
 *           description: 海報圖片路徑
 *           example: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: 上映日期
 *           example: "2021-12-15"
 *         popularity:
 *           type: number
 *           description: 熱門程度
 *           example: 123.45
 *         voteAverage:
 *           type: number
 *           description: 平均評分
 *           example: 8.5
 *         voteCount:
 *           type: integer
 *           description: 評分人數
 *           example: 1000
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