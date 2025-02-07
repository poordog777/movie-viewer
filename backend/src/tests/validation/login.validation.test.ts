import { expect } from 'chai';
import { loginSchema } from '../../validators/auth.validator';

describe('Login Schema Validation', () => {
  context('當提供有效的登入資料時', () => {
    it('應該通過驗證', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const { error } = loginSchema.validate(validData);
      expect(error).to.be.undefined;
    });
  });

  context('當提供無效的 email 格式時', () => {
    it('應該回傳錯誤訊息', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('電子郵件格式不正確');
    });
  });

  context('當密碼長度小於 8 個字元時', () => {
    it('應該回傳錯誤訊息', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('密碼長度至少需要 8 個字元');
    });
  });

  context('當缺少必要欄位時', () => {
    it('缺少 email 時應該回傳錯誤訊息', () => {
      const invalidData = {
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('請提供電子郵件');
    });

    it('缺少 password 時應該回傳錯誤訊息', () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const { error } = loginSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('請提供密碼');
    });
  });
});