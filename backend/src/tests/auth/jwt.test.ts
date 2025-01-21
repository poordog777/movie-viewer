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

    it('應該拒絕無效的 token', async () => {
      const invalidToken = 'invalid.token.here';
      
      try {
        await verifyToken(invalidToken);
        throw new Error('應該要拋出錯誤');
      } catch (error: any) {
        expect(error.message).to.equal('無效的認證令牌');
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
  });
}); 