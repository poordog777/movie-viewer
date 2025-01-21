import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': '名稱至少需要 2 個字元',
      'string.max': '名稱不能超過 50 個字元'
    }),
  email: Joi.string()
    .email()
    .messages({
      'string.email': '電子郵件格式不正確'
    })
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': '請提供目前的密碼'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '新密碼長度至少需要 8 個字元',
      'string.pattern.base': '新密碼需包含大小寫字母和數字',
      'any.required': '請提供新密碼'
    })
}); 