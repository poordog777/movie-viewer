import request from 'supertest';
import { expect } from 'chai';
import { app } from '../../app';
import sinon from 'sinon';
import { User } from '@prisma/client';
import * as database from '../../config/database';
import * as jwtUtils from '../../utils/jwt.utils';
import { AppError, ErrorCodes } from '../../types/error';

describe('認證測試', () => {
  describe('POST /auth/logout', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      google_id: 'test-google-id-123',
      created_at: new Date(),
      updated_at: new Date()
    };

    let verifyTokenStub: sinon.SinonStub;
    let prismaMock: any;

    beforeEach(() => {
      // 清理所有存根
      sinon.restore();
      
      // 創建 prisma mock
      prismaMock = {
        user: {
          findUnique: sinon.stub()
        }
      };

      // 替換 prisma 實例
      sinon.stub(database, 'prisma').value(prismaMock);
      
      // 模擬token驗證
      verifyTokenStub = sinon.stub(jwtUtils, 'verifyToken').returns({
        userId: mockUser.id,
        email: mockUser.email
      });

      // 默認返回mockUser
      prismaMock.user.findUnique.resolves(mockUser);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('應該在提供有效token時返回成功響應', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('success');
      expect(response.body.message).to.equal('登出成功');
    });

    it('應該在用戶不存在時返回401', async () => {
      // 設置用戶不存在的情況
      prismaMock.user.findUnique.resolves(null);

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .send();

      expect(response.status).to.equal(401);
      expect(response.body.errorCode).to.equal(ErrorCodes.AUTH_INVALID_CREDENTIALS);
    });

    it('應該在token無效時返回401', async () => {
      verifyTokenStub.throws(
        new AppError(401, '無效的認證令牌', ErrorCodes.AUTH_INVALID_TOKEN)
      );

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .send();

      expect(response.status).to.equal(401);
      expect(response.body.errorCode).to.equal(ErrorCodes.AUTH_INVALID_TOKEN);
    });
  });
});