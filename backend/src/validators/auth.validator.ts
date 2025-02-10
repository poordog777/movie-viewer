import Joi from 'joi';

export const googleCallbackSchema = Joi.object({
  state: Joi.string()
    .required()
    .messages({
      'any.required': '缺少 state 參數'
    }),
  code: Joi.string()
    .required()
    .messages({
      'any.required': '缺少 authorization code'
    })
});