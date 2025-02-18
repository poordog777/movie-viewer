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
 *
 *     ApiSuccessResponse:
 *       type: object
 *       required:
 *         - status
 *         - data
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *           description: API 響應狀態
 *         data:
 *           type: object
 *           description: 響應數據
 *
 *     ApiErrorResponse:
 *       type: object
 *       required:
 *         - status
 *         - errorCode
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail]
 *           description: API 響應狀態
 *         message:
 *           type: string
 *           description: 錯誤消息
 *         errorCode:
 *           type: string
 *           description: 錯誤代碼
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
 *         - original_title
 *         - original_language
 *         - adult
 *         - video
 *         - genre_ids
 *         - genres
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
 *           example: "/oxM2ZU1OtLHtKKQg1KMLFnjvAn2.jpg"
 *         release_date:
 *           type: string
 *           format: date
 *           description: 上映日期
 *           example: "2021-12-15"
 *         popularity:
 *           type: number
 *           description: 熱門程度
 *           example: 183.47
 *         original_title:
 *           type: string
 *           description: 原始標題
 *           example: "Spider-Man: No Way Home"
 *         original_language:
 *           type: string
 *           description: 原始語言
 *           example: "en"
 *         overview:
 *           type: string
 *           nullable: true
 *           description: 電影簡介
 *           example: "故事接續《蜘蛛人：離家日》片尾，描述號角日報對外公佈了蜘蛛人真實身份是彼得帕克後..."
 *         backdrop_path:
 *           type: string
 *           nullable: true
 *           description: 背景圖片路徑
 *           example: "/AeK2MPOpYrOOgZNfFnfwp0L8tNn.jpg"
 *         vote_average:
 *           type: number
 *           description: 平均評分
 *           example: 7.9
 *         vote_count:
 *           type: integer
 *           description: 評分人數
 *           example: 20510
 *         adult:
 *           type: boolean
 *           description: 是否為成人內容
 *           example: false
 *         video:
 *           type: boolean
 *           description: 是否有影片
 *           example: false
 *         genre_ids:
 *           type: array
 *           description: 電影類型ID列表
 *           items:
 *             type: integer
 *           example: [28, 12, 878]
 *         genres:
 *           type: array
 *           description: 電影類型詳細資訊（已轉換為中文）
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - name
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
 *           example: 1921847111
 *         runtime:
 *           type: integer
 *           description: 片長(分鐘)
 *           example: 148
 *         imdb_id:
 *           type: string
 *           description: IMDB ID
 *           example: "tt10872600"
 *         status:
 *           type: string
 *           description: 電影狀態
 *           example: "Released"
 *         belongs_to_collection:
 *           type: object
 *           nullable: true
 *           description: 電影系列資訊
 *           properties:
 *             id:
 *               type: integer
 *               example: 531241
 *             name:
 *               type: string
 *               example: "新版蜘蛛人三部曲"
 *             poster_path:
 *               type: string
 *               example: "/kcACSFXY1WfNmHvGjWM09WV3eTw.jpg"
 *             backdrop_path:
 *               type: string
 *               example: "/AvnqpRwlEaYNVL6wzC4RN94EdSd.jpg"
 *         production_companies:
 *           type: array
 *           description: 製作公司
 *           items:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - origin_country
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 420
 *               logo_path:
 *                 type: string
 *                 nullable: true
 *                 example: "/hUzeosd33nzE5MCNsZxCGEKTXaQ.png"
 *               name:
 *                 type: string
 *                 example: "Marvel Studios"
 *               origin_country:
 *                 type: string
 *                 example: "US"
 *         production_countries:
 *           type: array
 *           description: 製作國家
 *           items:
 *             type: object
 *             required:
 *               - iso_3166_1
 *               - name
 *             properties:
 *               iso_3166_1:
 *                 type: string
 *                 example: "US"
 *               name:
 *                 type: string
 *                 example: "United States of America"
 *         spoken_languages:
 *           type: array
 *           description: 電影語言
 *           items:
 *             type: object
 *             required:
 *               - english_name
 *               - iso_639_1
 *               - name
 *             properties:
 *               english_name:
 *                 type: string
 *                 example: "English"
 *               iso_639_1:
 *                 type: string
 *                 example: "en"
 *               name:
 *                 type: string
 *                 example: "English"
 *         origin_country:
 *           type: array
 *           description: 原產國
 *           items:
 *             type: string
 *           example: ["US"]
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