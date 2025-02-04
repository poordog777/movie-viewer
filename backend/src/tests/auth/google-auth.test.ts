import '../setup';
import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { app } from '../../server';
import { prisma } from '../../config/database/postgresql';
import { StateManager } from '../../config/oauth';

describe('Google OAuth 認證測試', () => {
  // 在每個測試後清理
  afterEach(() => {
    sinon.restore();
    StateManager.clearExpiredStates();
  });

  it('應該提供 Google 登入的 URL', (done) => {
    // 模擬 StateManager.generateState
    sinon.stub(StateManager, 'generateState').returns('test-state');
    
    // 模擬 passport.authenticate
    const authenticateStub = sinon.stub(passport, 'authenticate').returns(
      (req: Request, res: Response, next: NextFunction) => {
        res.redirect('https://accounts.google.com/o/oauth2/v2/auth?test-params');
      }
    );

    request(app)
      .get('/api/v1/auth/google')
      .expect(302)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.header.location).to.include('accounts.google.com');
        expect(res.header.location).to.include('o/oauth2/v2/auth');
        expect(authenticateStub.calledWith('google')).to.be.true;
        done();
      });
  });

  it('應該正確處理 Google callback 請求', (done) => {
    const mockUser = {
      id: 1,
      email: 'test@gmail.com',
      name: 'Test User',
      password: 'dummy-password',
      googleId: '123456789',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 模擬 state 驗證
    sinon.stub(StateManager, 'verifyState').returns(true);

    // 模擬資料庫查詢
    sinon.stub(prisma.user, 'findUnique').resolves(mockUser);

    // 模擬 passport authenticate
    sinon.stub(passport, 'authenticate').returns((req: Request, res: Response, next: NextFunction) => {
      const callback = (error: Error | null, user: typeof mockUser) => {
        res.json({
          status: 'success',
          data: {
            token: 'mock-token',
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          }
        });
      };
      callback(null, mockUser);
    });

    request(app)
      .get('/api/v1/auth/google/callback')
      .query({
        code: 'mock-auth-code',
        state: 'test-state'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('status', 'success');
        expect(res.body.data).to.have.property('token');
        expect(res.body.data.user).to.have.property('email', 'test@gmail.com');
        done();
      });
  });
});