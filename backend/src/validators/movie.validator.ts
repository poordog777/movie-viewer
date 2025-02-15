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
  })
};