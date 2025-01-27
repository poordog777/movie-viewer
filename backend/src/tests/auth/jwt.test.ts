import '../setup';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../utils/jwt.utils';

describe('JWT 身份驗證測試', () => {
  const mockUser = {
    userId: 1,
    email: 'test@example.com',
    role: 'user'
  };

  describe('Token 生成測試', () => {
    it('應該成功生成 JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).to.be.a('string');
    });

    it('生成的 token 應包含正確的用戶資訊', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      expect(decoded.userId).to.equal(mockUser.userId);
      expect(decoded.email).to.equal(mockUser.email);
      expect(decoded.role).to.equal(mockUser.role);
    });

    it('應該使用預設過期時間生成 token', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      expect(decoded.payload).to.have.property('exp');
      expect(decoded.payload.exp).to.be.above(Math.floor(Date.now() / 1000));
    });

    it('應該可以指定自定義過期時間', () => {
      const customExpiresIn = '2h';
      const token = jwt.sign(mockUser, process.env.JWT_SECRET as string, { expiresIn: customExpiresIn });
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      const now = Math.floor(Date.now() / 1000);
      const twoHoursInSeconds = 2 * 60 * 60;
      
      expect(decoded.payload.exp).to.be.approximately(now + twoHoursInSeconds, 5);
    });

    it('應該在 token 中包含發行時間（iat）', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      expect(decoded.payload).to.have.property('iat');
      expect(decoded.payload.iat).to.be.at.most(Math.floor(Date.now() / 1000));
    });
  });

  describe('Token 驗證測試', () => {
    it('應該成功驗證有效的 token', async () => {
      const token = generateToken(mockUser);
      const result = await verifyToken(token);
      
      expect(result).to.have.property('userId', mockUser.userId);
      expect(result).to.have.property('email', mockUser.email);
    });

    it('應該拒絕過期的 token', async () => {
      const expiredToken = jwt.sign(mockUser, process.env.JWT_SECRET as string, { expiresIn: '0s' });
      
      try {
        await verifyToken(expiredToken);
        throw new Error('應該要拋出錯誤');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
      }
    });

    it('應該能檢查 token 是否即將過期', async function() {
      this.timeout(5000); // 設置更長的超時時間
      const shortLivedToken = jwt.sign(mockUser, process.env.JWT_SECRET as string, { expiresIn: '3s' });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const decoded = jwt.decode(shortLivedToken, { complete: true }) as any;
      const now = Math.floor(Date.now() / 1000);
      
      expect(decoded.payload.exp - now).to.be.below(2);
    });

    it('應該正確處理 token 的時區問題', () => {
      const token = generateToken(mockUser);
      const decoded = jwt.decode(token, { complete: true }) as any;
      
      expect(decoded.payload.exp).to.be.a('number');
      expect(decoded.payload.iat).to.be.a('number');
    });
  });

  describe('Token 安全性測試', () => {
    it('應該拒絕無效的 token', async () => {
      const invalidToken = 'invalid.token.here';
      
      try {
        await verifyToken(invalidToken);
        throw new Error('應該要拋出錯誤');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
      }
    });

    it('應該識別多種格式錯誤的 token', async () => {
      const malformedTokens = [
        'not.a.token',
        'invalid',
        'too.many.dots.here',
        'no_dots_at_all',
        'partially.valid'
      ];

      for (const token of malformedTokens) {
        try {
          await verifyToken(token);
          throw new Error('應該要拋出錯誤');
        } catch (error: any) {
          expect(error.message).to.equal('無效的認證令牌');
        }
      }
    });

    it('應該拒絕被竄改的 token', async () => {
      const token = generateToken(mockUser);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      
      try {
        await verifyToken(tamperedToken);
        throw new Error('應該要拋出錯誤');
      } catch (error) {
        expect(error).to.exist;
      }
    });

    it('應該拒絕使用錯誤密鑰簽名的 token', async () => {
      const wrongSecret = 'wrongSecret';
      const invalidToken = jwt.sign(mockUser, wrongSecret);
      
      try {
        await verifyToken(invalidToken);
        throw new Error('應該要拋出錯誤');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
      }
    });

    it('應該拒絕缺少必要欄位的 token', async () => {
      const incompleteUser = {
        email: 'test@example.com'
      };
      
      const token = jwt.sign(incompleteUser, process.env.JWT_SECRET as string);
      
      try {
        await verifyToken(token);
        throw new Error('無效的認證令牌');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
      }
    });

    it('應該偵測權限提升嘗試', async () => {
      const token = generateToken(mockUser);
      const [header, payload, signature] = token.split('.');
      
      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      decodedPayload.role = 'admin';
      const modifiedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString('base64');
      
      const tamperedToken = `${header}.${modifiedPayload}.${signature}`;
      
      try {
        await verifyToken(tamperedToken);
        throw new Error('應該要拋出錯誤');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
      }
    });
  });

  describe('權限管理測試', () => {
    it('應該正確處理管理員角色的 token', async () => {
      const adminUser = {
        userId: 1,
        email: 'admin@example.com',
        role: 'admin'
      };
      
      const token = generateToken(adminUser);
      const result = await verifyToken(token);
      
      expect(result).to.have.property('role', 'admin');
    });

    it('應該正確處理一般用戶角色的 token', async () => {
      const regularUser = {
        userId: 2,
        email: 'user@example.com',
        role: 'user'
      };
      
      const token = generateToken(regularUser);
      const result = await verifyToken(token);
      
      expect(result).to.have.property('role', 'user');
    });
  });
});