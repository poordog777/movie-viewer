import { PrismaClient, User } from '@prisma/client';
import { expect } from 'chai';

const prisma = new PrismaClient();
const TEST_EMAIL = 'test@example.com';
const TEST_GOOGLE_ID = 'test_google_id';

describe('用戶創建測試', () => {
  beforeEach(async () => {
    // 每次測試前清理測試帳號的數據
    await prisma.rating.deleteMany({
      where: {
        user: {
          email: TEST_EMAIL
        }
      }
    });
    await prisma.favorite.deleteMany({
      where: {
        user: {
          email: TEST_EMAIL
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: TEST_EMAIL
      }
    });
  });

  it('應該能夠創建新用戶', async () => {
    await prisma.$transaction(async (tx) => {
      const userData = {
        email: TEST_EMAIL,
        password: 'hashedPassword123',
        name: 'Test User'
      };

      const user = await tx.user.create({
        data: userData
      });

      expect(user).to.have.property('id');
      expect(user.email).to.equal(userData.email);
      expect(user.name).to.equal(userData.name);
      expect(user.googleId).to.be.null;
    });
  });

  it('應該能夠創建具有 Google ID 的用戶', async () => {
    await prisma.$transaction(async (tx) => {
      const googleUser = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword456',
          name: 'Google User',
          googleId: TEST_GOOGLE_ID
        }
      });

      expect(googleUser).to.have.property('googleId', TEST_GOOGLE_ID);
    });
  });

  it('不應允許重複的電子郵件地址', async () => {
    await prisma.$transaction(async (tx) => {
      // 先創建一個用戶
      await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'First Test User'
        }
      });

      // 嘗試創建重複的郵件
      try {
        await tx.user.create({
          data: {
            email: TEST_EMAIL,
            password: 'hashedPassword789',
            name: 'Second Test User'
          }
        });
        throw new Error('不應到達此處');
      } catch (error: any) {
        expect(error.code).to.equal('P2002');
      }
    });
  });
});

describe('用戶評分測試', () => {
  beforeEach(async () => {
    await prisma.rating.deleteMany({
      where: {
        user: {
          email: TEST_EMAIL
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: TEST_EMAIL
      }
    });
  });

  it('應該能夠創建評分記錄', async () => {
    await prisma.$transaction(async (tx) => {
      // 創建測試用戶
      const user = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'Rating User'
        }
      });

      // 創建測試電影
      const movie = await tx.movie.create({
        data: {
          id: 12345,
          title: '測試電影',
          overview: '這是一部測試電影',
          releaseDate: new Date(),
          voteAverage: 0,
          voteCount: 0
        }
      });

      // 創建評分
      const rating = await tx.rating.create({
        data: {
          userId: user.id,
          movieId: movie.id,
          score: 4
        }
      });

      expect(rating.score).to.equal(4);
      expect(rating.movieId).to.equal(movie.id);
    });
  });

  it('不應允許無效的評分數值', async () => {
    await prisma.$transaction(async (tx) => {
      // 創建測試用戶
      const user = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'Invalid Rating User'
        }
      });

      // 創建測試電影
      const movie = await tx.movie.create({
        data: {
          id: 12346,
          title: '測試電影2',
          overview: '這是另一部測試電影',
          releaseDate: new Date(),
          voteAverage: 0,
          voteCount: 0
        }
      });

      const invalidScores = [0, 6, -1, 10];
      
      for (const invalidScore of invalidScores) {
        try {
          await tx.rating.create({
            data: {
              userId: user.id,
              movieId: movie.id,
              score: invalidScore
            }
          });
          throw new Error('不應到達此處');
        } catch (error: any) {
          expect(error).to.exist;
        }
      }
    });
  });

  it('不應允許對同一部電影重複評分', async () => {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'Duplicate Rating User'
        }
      });

      // 創建測試電影
      const movie = await tx.movie.create({
        data: {
          id: 12347,
          title: '測試電影3',
          overview: '這是第三部測試電影',
          releaseDate: new Date(),
          voteAverage: 0,
          voteCount: 0
        }
      });

      // 第一次評分
      await tx.rating.create({
        data: {
          userId: user.id,
          movieId: movie.id,
          score: 4
        }
      });

      // 嘗試重複評分
      try {
        await tx.rating.create({
          data: {
            userId: user.id,
            movieId: movie.id,
            score: 5
          }
        });
        throw new Error('不應到達此處');
      } catch (error: any) {
        expect(error.code).to.equal('P2002');
      }
    });
  });
});

describe('用戶收藏測試', () => {
  beforeEach(async () => {
    await prisma.favorite.deleteMany({
      where: {
        user: {
          email: TEST_EMAIL
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: TEST_EMAIL
      }
    });
  });

  it('應該能夠創建收藏記錄', async () => {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'Favorite User'
        }
      });

      const favorite = await tx.favorite.create({
        data: {
          userId: user.id,
          movieId: 12345
        }
      });

      expect(favorite.movieId).to.equal(12345);
    });
  });

  it('不應允許重複收藏同一部電影', async () => {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: TEST_EMAIL,
          password: 'hashedPassword123',
          name: 'Duplicate Favorite User'
        }
      });

      // 第一次收藏
      await tx.favorite.create({
        data: {
          userId: user.id,
          movieId: 12345
        }
      });

      // 嘗試重複收藏
      try {
        await tx.favorite.create({
          data: {
            userId: user.id,
            movieId: 12345
          }
        });
        throw new Error('不應到達此處');
      } catch (error: any) {
        expect(error.code).to.equal('P2002');
      }
    });
  });
});

after(async () => {
  await prisma.$disconnect();
});