import { expect } from 'chai';
import sinon from 'sinon';
import { PrismaClient } from '@prisma/client';
import { initializeDatabase, prisma } from '../../config/database';

describe('資料庫', () => {
  describe('初始化連線', () => {
    let prismaConnectStub: sinon.SinonStub;
    
    beforeEach(() => {
      // 重置所有 stub
      sinon.restore();
      
      // 確保 prisma 實例已經建立
      prismaConnectStub = sinon.stub(PrismaClient.prototype, '$connect');
    });
    
    afterEach(() => {
      sinon.restore();
    });

    it('應該成功初始化 PostgreSQL 連線', async () => {
      prismaConnectStub.resolves();
      
      await initializeDatabase();
      expect(prismaConnectStub.calledOnce).to.be.true;
    });
    
    it('當 PostgreSQL 連線失敗時應該拋出錯誤', async () => {
      const connectionError = new Error('連線錯誤');
      prismaConnectStub.rejects(connectionError);
      
      try {
        await initializeDatabase();
        expect.fail('應該拋出錯誤');
      } catch (err) {
        expect(err).to.equal(connectionError);
      }
    });
  });
});