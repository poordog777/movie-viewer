import Joi from 'joi';

export const googleCallbackSchema = Joi.object({
  code: Joi.string()
    .required()
    .messages({
      'any.required': '缺少 authorization code'
    })
});