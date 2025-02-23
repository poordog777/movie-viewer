import { PrismaClient, User } from '@prisma/client';
import { expect } from 'chai';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * 生成隨機用戶資料
 */
const generateRandomUser = () => ({
  email: `test.${crypto.randomBytes(8).toString('hex')}@example.com`,
  name: 'Test User',
  google_id: `google_${crypto.randomBytes(16).toString('hex')}`,
});

describe('User Model Tests', () => {
  let testUser: User;

  after(async () => {
    await prisma.$disconnect();
  });

  describe('創建和讀取用戶', () => {
    it('應該能成功創建新用戶並讀取', async () => {
      // 創建用戶
      const userData = generateRandomUser();
      testUser = await prisma.user.create({
        data: userData
      });

      // 驗證創建的用戶資料
      expect(testUser).to.have.property('id');
      expect(testUser.email).to.equal(userData.email);
      expect(testUser.name).to.equal(userData.name);
      expect(testUser.google_id).to.equal(userData.google_id);
      expect(testUser.created_at).to.be.instanceOf(Date);
      expect(testUser.updated_at).to.be.instanceOf(Date);

      // 通過 id 讀取用戶
      const foundUser = await prisma.user.findUnique({
        where: { id: testUser.id }
      });

      expect(foundUser).to.not.be.null;
      expect(foundUser?.id).to.equal(testUser.id);
      expect(foundUser?.email).to.equal(userData.email);
      expect(foundUser?.google_id).to.equal(userData.google_id);
    });

    it('不應該允許創建具有相同 email 的用戶', async () => {
      const userData = generateRandomUser();
      userData.email = testUser.email; // 使用相同的 email

      try {
        await prisma.user.create({
          data: userData
        });
        expect.fail('應該拋出錯誤');
      } catch (error) {
        expect(error).to.have.property('code', 'P2002'); // Prisma 唯一約束錯誤
      }
    });
  });
});
