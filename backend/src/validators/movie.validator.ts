import Joi from 'joi';

/**
 * 電影API參數驗證schemas
 */
export const movieValidators = {

  /**
   * 搜索參數驗證
   */
  searchQuery: Joi.object({
    query: Joi.string()
      .required()
      .min(1)
      .max(100)
      .description('搜索關鍵詞'),
    page: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .default(1)
      .description('頁碼')
  }),

  /**
   * 電影ID參數驗證
   */
  movieId: Joi.object({
    movieId: Joi.number()
      .integer()
      .positive()
      .required()
      .description('電影ID')
  }),

  /**
   * 電影評分參數驗證
   */
  movieRating: Joi.object({
    score: Joi.number()
      .integer()
      .min(1)
      .max(10)
      .required()
      .messages({
        'number.base': '評分必須是數字',
        'number.integer': '評分必須是整數',
        'number.min': '評分不能小於 1 分',
        'number.max': '評分不能超過 10 分',
        'any.required': '請提供評分'
      })
      .description('評分(1-10分)')
  })
};