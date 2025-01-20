import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '電子郵件格式不正確',
      'any.required': '請提供電子郵件'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': '密碼長度至少需要 8 個字元',
      'any.required': '請提供密碼'
    })
});

export const registerSchema = Joi.object({
  name: Joi.string()
    .required()
    .messages({
      'any.required': '請提供使用者名稱'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '電子郵件格式不正確',
      'any.required': '請提供電子郵件'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密碼長度至少需要 8 個字元',
      'string.pattern.base': '密碼需包含大小寫字母和數字',
      'any.required': '請提供密碼'
    })
}); 