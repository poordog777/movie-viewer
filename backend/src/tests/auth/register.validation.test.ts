import { expect } from 'chai';
import { registerSchema } from '../../validators/auth.validator';

describe('Register Schema Validation', () => {
  context('當提供有效的註冊資料時', () => {
    it('應該通過驗證', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };

      const { error } = registerSchema.validate(validData);
      expect(error).to.be.undefined;
    });
  });

  context('當密碼格式不符合要求時', () => {
    it('缺少大寫字母時應該回傳錯誤', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('密碼需包含大小寫字母和數字');
    });

    it('缺少小寫字母時應該回傳錯誤', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'PASSWORD123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('密碼需包含大小寫字母和數字');
    });

    it('缺少數字時應該回傳錯誤', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'PasswordTest'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('密碼需包含大小寫字母和數字');
    });
  });

  context('當提供無效的 email 格式時', () => {
    it('應該回傳錯誤訊息', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('電子郵件格式不正確');
    });
  });

  context('當缺少必要欄位時', () => {
    it('缺少 name 時應該回傳錯誤訊息', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('請提供使用者名稱');
    });

    it('缺少 email 時應該回傳錯誤訊息', () => {
      const invalidData = {
        name: 'Test User',
        password: 'Password123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('請提供電子郵件');
    });

    it('缺少 password 時應該回傳錯誤訊息', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('請提供密碼');
    });
  });

  context('當密碼長度小於 8 個字元時', () => {
    it('應該回傳錯誤訊息', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Pass123'
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).to.not.be.undefined;
      expect(error?.details[0].message).to.equal('密碼長度至少需要 8 個字元');
    });
  });
});