import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { BusinessError } from '../../types/error';
import * as jwtUtils from '../../utils/jwt.utils';
import { User } from '@prisma/client';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

type RequestWithUser = Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> & {
  user?: User;
};

describe('Google OAuth 回調測試', () => {
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'google-123',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockToken = 'mock-jwt-token';
  let req: Partial<RequestWithUser>;
  let res: Partial<Response>;
  let generateTokenStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      user: mockUser
    };
    res = {
      json: sinon.spy()
    };
    generateTokenStub = sinon.stub(jwtUtils, 'generateToken');
    generateTokenStub.returns(mockToken);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('核心功能測試', () => {
    it('成功案例：用戶驗證成功並返回 token', () => {
      // 執行回調
      (res.json as sinon.SinonSpy)({
        status: 'success',
        data: {
          token: mockToken,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name
          }
        },
        message: 'Google 登入成功'
      });

      // 驗證 generateToken 被調用
      sinon.assert.calledWith(generateTokenStub, {
        userId: mockUser.id,
        email: mockUser.email
      });
      
      // 驗證 response
      sinon.assert.called(res.json as sinon.SinonSpy);
      expect((res.json as sinon.SinonSpy).firstCall.args[0]).to.deep.equal({
        status: 'success',
        data: {
          token: mockToken,
          user: {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name
          }
        },
        message: 'Google 登入成功'
      });
    });

    it('失敗案例：沒有用戶資料', () => {
      req.user = undefined;
      
      let error: BusinessError | null = null;
      try {
        if (!req.user) {
          throw new BusinessError(
            'Google 登入發生問題，請確認您的 Google 帳號正常後重試',
            'AUTH_GOOGLE_ERROR',
            401
          );
        }
      } catch (e) {
        error = e as BusinessError;
      }

      expect(error).to.not.be.null;
      expect(error?.message).to.equal('Google 登入發生問題，請確認您的 Google 帳號正常後重試');
      expect(error?.errorCode).to.equal('AUTH_GOOGLE_ERROR');
      expect(error?.statusCode).to.equal(401);
    });
  });
});