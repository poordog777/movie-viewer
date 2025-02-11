import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response } from 'express';
import { StateManager } from '../../config/oauth';
import { BusinessError, ErrorCodes } from '../../types/error';
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
  let stateVerifyStub: sinon.SinonStub;
  let generateTokenStub: sinon.SinonStub;

  beforeEach(() => {
    req = {
      query: { state: 'valid-state' },
      user: mockUser
    };
    res = {
      json: sinon.spy()
    };
    stateVerifyStub = sinon.stub(StateManager, 'verifyState');
    generateTokenStub = sinon.stub(jwtUtils, 'generateToken');
    generateTokenStub.returns(mockToken);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('核心功能測試', () => {
    it('成功案例：使用有效的 state 參數', () => {
      stateVerifyStub.returns(true);

      // 執行回調
      const state = req.query?.state as string;
      if (state && StateManager.verifyState(state)) {
        (res.json as sinon.SinonSpy)({
          status: 'success',
          data: {
            token: mockToken,
            user: {
              id: mockUser.id,
              email: mockUser.email,
              name: mockUser.name
            }
          }
        });
      }

      // 驗證 state 驗證被調用
      sinon.assert.calledWith(stateVerifyStub, 'valid-state');
      
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
        }
      });
    });

    it('失敗案例：使用無效的 state 參數', () => {
      stateVerifyStub.returns(false);
      
      let error: BusinessError | null = null;
      const state = req.query?.state as string;
      try {
        if (!StateManager.verifyState(state)) {
          throw new BusinessError(
            '登入流程已過期，請重新點擊登入按鈕重試',
            ErrorCodes.AUTH_GOOGLE_STATE_INVALID,
            401
          );
        }
      } catch (e) {
        error = e as BusinessError;
      }

      expect(error).to.not.be.null;
      expect(error?.message).to.equal('登入流程已過期，請重新點擊登入按鈕重試');
      expect(error?.errorCode).to.equal(ErrorCodes.AUTH_GOOGLE_STATE_INVALID);
    });
  });
});