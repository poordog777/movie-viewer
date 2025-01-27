import { expect } from 'chai';
import bcrypt from 'bcrypt';

describe('Password Encryption Tests', () => {
  const testPassword = 'TestPassword123';
  const saltRounds = 10;

  context('密碼加密測試', () => {
    it('應該成功生成密碼雜湊', async () => {
      const hash = await bcrypt.hash(testPassword, saltRounds);
      expect(hash).to.be.a('string');
      expect(hash).to.not.equal(testPassword);
      expect(hash.startsWith('$2b$')).to.be.true; // bcrypt 雜湊的特徵
    });

    it('相同密碼應該生成不同的雜湊', async () => {
      const hash1 = await bcrypt.hash(testPassword, saltRounds);
      const hash2 = await bcrypt.hash(testPassword, saltRounds);
      expect(hash1).to.not.equal(hash2);
    });

    it('空密碼應該拋出錯誤', async () => {
      try {
        await bcrypt.hash('', saltRounds);
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.exist;
      }
    });
  });

  context('密碼比對測試', () => {
    let hashedPassword: string;

    beforeEach(async () => {
      hashedPassword = await bcrypt.hash(testPassword, saltRounds);
    });

    it('正確密碼應該匹配成功', async () => {
      const isMatch = await bcrypt.compare(testPassword, hashedPassword);
      expect(isMatch).to.be.true;
    });

    it('錯誤密碼應該匹配失敗', async () => {
      const isMatch = await bcrypt.compare('WrongPassword123', hashedPassword);
      expect(isMatch).to.be.false;
    });

    it('空密碼應該匹配失敗', async () => {
      const isMatch = await bcrypt.compare('', hashedPassword);
      expect(isMatch).to.be.false;
    });

    it('對不同雜湊值的相同密碼應該都能匹配成功', async () => {
      const hash1 = await bcrypt.hash(testPassword, saltRounds);
      const hash2 = await bcrypt.hash(testPassword, saltRounds);
      
      const isMatch1 = await bcrypt.compare(testPassword, hash1);
      const isMatch2 = await bcrypt.compare(testPassword, hash2);
      
      expect(isMatch1).to.be.true;
      expect(isMatch2).to.be.true;
    });
  });
});