import { PrismaClient, User } from '@prisma/client';
import { expect } from 'chai';

const prisma = new PrismaClient();

describe('user model 測試', () => {
  let testUser: User;

  before(async () => {
    // 清理測試資料
    await prisma.rating.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.user.deleteMany();
  });

  it('應該能夠創建新用戶', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedPassword123',
      name: 'Test User'
    };

    testUser = await prisma.user.create({
      data: userData
    });

    expect(testUser).to.have.property('id');
    expect(testUser.email).to.equal(userData.email);
    expect(testUser.name).to.equal(userData.name);
    expect(testUser.googleId).to.be.null;
  });

  it('應該能夠創建具有 Google ID 的用戶', async () => {
    const googleUser = await prisma.user.create({
      data: {
        email: 'google@example.com',
        password: 'hashedPassword456',
        name: 'Google User',
        googleId: 'google123'
      }
    });

    expect(googleUser).to.have.property('googleId', 'google123');
  });

  it('不應允許重複的電子郵件地址', async () => {
    try {
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedPassword789',
          name: 'Duplicate User'
        }
      });
      throw new Error('不應到達此處');
    } catch (error: any) {
      expect(error.code).to.equal('P2002'); // Prisma 唯一性約束違規
    }
  });

  describe('用戶評分測試', () => {
    it('應該能夠創建評分記錄', async () => {
      const rating = await prisma.rating.create({
        data: {
          userId: testUser.id,
          movieId: 12345,
          score: 4
        }
      });

      expect(rating.score).to.equal(4);
      expect(rating.movieId).to.equal(12345);
    });

    it('不應允許無效的評分數值', async () => {
      // 評分必須在 1-5 之間，使用 Prisma 的驗證
      const invalidScores = [0, 6, -1, 10];
      
      for (const invalidScore of invalidScores) {
        try {
          await prisma.rating.create({
            data: {
              userId: testUser.id,
              movieId: 12346,
              score: invalidScore
            }
          });
          throw new Error('不應到達此處');
        } catch (error: any) {
          // PostgreSQL 可能會返回不同的錯誤訊息，所以我們只檢查是否拋出了錯誤
          expect(error).to.exist;
          if (error.message === '不應到達此處') {
            throw new Error('無效的評分應該被拒絕');
          }
        }
      }
    });

    it('不應允許對同一部電影重複評分', async () => {
      try {
        await prisma.rating.create({
          data: {
            userId: testUser.id,
            movieId: 12345, // 已評分過的電影
            score: 5
          }
        });
        throw new Error('不應到達此處');
      } catch (error: any) {
        expect(error.code).to.equal('P2002');
      }
    });
  });

  describe('用戶收藏測試', () => {
    it('應該能夠創建收藏記錄', async () => {
      const favorite = await prisma.favorite.create({
        data: {
          userId: testUser.id,
          movieId: 12345
        }
      });

      expect(favorite.movieId).to.equal(12345);
    });

    it('不應允許重複收藏同一部電影', async () => {
      try {
        await prisma.favorite.create({
          data: {
            userId: testUser.id,
            movieId: 12345 // 已收藏的電影
          }
        });
        throw new Error('不應到達此處');
      } catch (error: any) {
        expect(error.code).to.equal('P2002');
      }
    });
  });

  after(async () => {
    // 清理測試資料
    await prisma.rating.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });
});